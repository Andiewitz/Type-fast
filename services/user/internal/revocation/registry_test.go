package revocation_test

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/google/uuid"

	"typefast/services/user/internal/revocation"
)

func TestTokenRevoked(t *testing.T) {
	userID := uuid.New()
	banAt := time.Date(2026, 11, 5, 12, 0, 0, 700_000_000, time.UTC)

	registry := revocation.NewRegistry(&fakeSource{}, nil)
	registry.Revoke(userID, banAt)

	tests := []struct {
		name     string
		userID   uuid.UUID
		issuedAt time.Time
		want     bool
	}{
		{name: "token issued a minute before the ban", userID: userID, issuedAt: banAt.Add(-time.Minute), want: true},
		{name: "token issued in the previous second", userID: userID, issuedAt: banAt.Truncate(time.Second).Add(-time.Second), want: true},
		{name: "token issued earlier in the ban second", userID: userID, issuedAt: banAt.Truncate(time.Second), want: false},
		{name: "token issued after the ban", userID: userID, issuedAt: banAt.Add(time.Second), want: false},
		{name: "token with no issued-at", userID: userID, issuedAt: time.Time{}, want: true},
		{name: "different account", userID: uuid.New(), issuedAt: banAt.Add(-time.Hour), want: false},
		{name: "unknown account", userID: uuid.New(), issuedAt: banAt, want: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := registry.TokenRevoked(test.userID, test.issuedAt); got != test.want {
				t.Fatalf("TokenRevoked = %v, want %v", got, test.want)
			}
		})
	}
}

func TestRevokeKeepsLatestMarker(t *testing.T) {
	userID := uuid.New()
	newer := time.Date(2026, 11, 5, 12, 0, 0, 0, time.UTC)
	older := newer.Add(-time.Hour)

	registry := revocation.NewRegistry(&fakeSource{}, nil)
	registry.Revoke(userID, newer)
	registry.Revoke(userID, older)

	if !registry.TokenRevoked(userID, newer.Add(-time.Minute)) {
		t.Fatal("an older marker must not shorten an existing ban")
	}
}

func TestRevokeBeforeFirstRefreshIsEnforced(t *testing.T) {
	userID := uuid.New()
	registry := revocation.NewRegistry(&fakeSource{}, nil)

	registry.Revoke(userID, time.Now().UTC())

	if !registry.TokenRevoked(userID, time.Now().UTC().Add(-time.Minute)) {
		t.Fatal("a locally written ban must apply before any refresh")
	}
}

func TestRefreshLoadsAndReplacesSnapshot(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	banAt := time.Now().UTC()
	source := &fakeSource{entries: []revocation.Entry{{UserID: userID, Before: banAt}}}

	registry := revocation.NewRegistry(source, nil)
	if err := registry.Refresh(ctx); err != nil {
		t.Fatalf("refresh: %v", err)
	}
	if !registry.TokenRevoked(userID, banAt.Add(-time.Minute)) {
		t.Fatal("expected the stored ban to be enforced")
	}

	// Lifting the ban removes it from the next snapshot.
	source.setEntries(nil)
	if err := registry.Refresh(ctx); err != nil {
		t.Fatalf("refresh: %v", err)
	}
	if registry.TokenRevoked(userID, banAt.Add(-time.Minute)) {
		t.Fatal("expected a lifted ban to stop applying")
	}
}

func TestRefreshKeepsSnapshotOnError(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	banAt := time.Now().UTC()
	source := &fakeSource{entries: []revocation.Entry{{UserID: userID, Before: banAt}}}

	registry := revocation.NewRegistry(source, nil)
	if err := registry.Refresh(ctx); err != nil {
		t.Fatalf("refresh: %v", err)
	}

	source.setErr(errors.New("database unavailable"))
	if err := registry.Refresh(ctx); err == nil {
		t.Fatal("expected the refresh error to surface")
	}
	if !registry.TokenRevoked(userID, banAt.Add(-time.Minute)) {
		t.Fatal("a failed refresh must keep enforcing the previous snapshot")
	}
}

func TestRunRefreshesUntilCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	source := &fakeSource{}
	registry := revocation.NewRegistry(source, nil)

	done := make(chan struct{})
	go func() {
		registry.Run(ctx, 5*time.Millisecond)
		close(done)
	}()

	deadline := time.Now().Add(2 * time.Second)
	for source.calls() < 3 {
		if time.Now().After(deadline) {
			t.Fatalf("expected repeated refreshes, got %d", source.calls())
		}
		time.Sleep(2 * time.Millisecond)
	}

	cancel()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("Run did not stop after cancellation")
	}

	stopped := source.calls()
	time.Sleep(30 * time.Millisecond)
	if source.calls() != stopped {
		t.Fatal("Run kept refreshing after cancellation")
	}
}

func TestRunContinuesAfterRefreshError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	source := &fakeSource{err: errors.New("boom")}
	registry := revocation.NewRegistry(source, nil)
	go registry.Run(ctx, 5*time.Millisecond)

	deadline := time.Now().Add(2 * time.Second)
	for source.calls() < 3 {
		if time.Now().After(deadline) {
			t.Fatalf("expected retries after errors, got %d calls", source.calls())
		}
		time.Sleep(2 * time.Millisecond)
	}
}

func TestConcurrentRevokeAndCheck(t *testing.T) {
	registry := revocation.NewRegistry(&fakeSource{}, nil)
	base := time.Now().UTC()

	var wg sync.WaitGroup
	for i := 0; i < 16; i++ {
		wg.Add(2)
		go func(offset int) {
			defer wg.Done()
			registry.Revoke(uuid.New(), base.Add(time.Duration(offset)*time.Second))
		}(i)
		go func() {
			defer wg.Done()
			registry.TokenRevoked(uuid.New(), base)
		}()
	}
	wg.Wait()
}

// fakeSource is a controllable Source for tests.
type fakeSource struct {
	mu      sync.Mutex
	entries []revocation.Entry
	err     error
	count   atomic.Int64
}

func (s *fakeSource) ListRevocations(context.Context) ([]revocation.Entry, error) {
	s.count.Add(1)
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.err != nil {
		return nil, s.err
	}
	return append([]revocation.Entry(nil), s.entries...), nil
}

func (s *fakeSource) setEntries(entries []revocation.Entry) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.entries = entries
}

func (s *fakeSource) setErr(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.err = err
}

func (s *fakeSource) calls() int64 {
	return s.count.Load()
}
