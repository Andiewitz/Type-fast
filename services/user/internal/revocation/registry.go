// Package revocation decides whether an access token has been invalidated by a
// ban or a forced sign-out.
//
// Access tokens are signed and verified offline, so nothing can recall one
// after it is issued. Instead the service keeps a small in-memory snapshot of
// revoked accounts, refreshed from storage on a timer.
//
// An account is rejected in one of two ways:
//   - it is suspended, so every token is refused regardless of age;
//   - it carries a marker from an earlier ban, so tokens issued at or before
//     that marker stay refused even after the account is reactivated.
//
// The snapshot holds revoked accounts only, so its size follows the number of
// bans rather than the number of users, and the per-request cost is a map
// lookup with no database round trip.
package revocation

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Entry is one account's revocation state.
type Entry struct {
	UserID uuid.UUID

	// Before is the moment the account was last banned. Tokens issued at or
	// before it are refused forever, even after reactivation.
	Before time.Time

	// Suspended refuses every token, including ones minted after the ban. This
	// is what makes a ban absolute: a refresh through an external identity
	// provider cannot mint its way back in.
	Suspended bool
}

// Source loads the current set of revoked accounts.
type Source interface {
	ListRevocations(ctx context.Context) ([]Entry, error)
}

// Registry is a concurrency-safe snapshot of revoked accounts.
type Registry struct {
	mu      sync.RWMutex
	revoked map[uuid.UUID]Entry
	source  Source
	logger  *slog.Logger
}

// NewRegistry creates an empty registry. Call Refresh before serving traffic so
// bans recorded before startup are enforced.
func NewRegistry(source Source, logger *slog.Logger) *Registry {
	if logger == nil {
		logger = slog.Default()
	}
	return &Registry{
		source:  source,
		logger:  logger,
		revoked: make(map[uuid.UUID]Entry),
	}
}

// Refresh replaces the snapshot with the current state from storage. When the
// source fails the previous snapshot is kept, so a database hiccup cannot
// silently un-ban everyone; the error is returned for the caller to log.
func (r *Registry) Refresh(ctx context.Context) error {
	entries, err := r.source.ListRevocations(ctx)
	if err != nil {
		return fmt.Errorf("revocation: refresh: %w", err)
	}

	next := make(map[uuid.UUID]Entry, len(entries))
	for _, entry := range entries {
		next[entry.UserID] = entry
	}

	r.mu.Lock()
	r.revoked = next
	r.mu.Unlock()
	return nil
}

// Revoke records a ban locally so the replica that wrote it enforces the ban on
// the next request instead of waiting for the next refresh.
func (r *Registry) Revoke(userID uuid.UUID, before time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.revoked[userID] = Entry{UserID: userID, Before: before, Suspended: true}
}

// Restore lifts a suspension locally, keeping the marker so tokens issued at or
// before it stay refused. An account that was never banned is dropped from the
// snapshot entirely.
func (r *Registry) Restore(userID uuid.UUID, before time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if before.IsZero() {
		delete(r.revoked, userID)
		return
	}
	r.revoked[userID] = Entry{UserID: userID, Before: before}
}

// TokenRevoked reports whether a token issued at issuedAt must be rejected.
// A zero issuedAt is treated as revoked: without a timestamp there is no way to
// prove the token postdates the ban.
func (r *Registry) TokenRevoked(userID uuid.UUID, issuedAt time.Time) bool {
	r.mu.RLock()
	entry, ok := r.revoked[userID]
	r.mu.RUnlock()
	if !ok {
		return false
	}

	if entry.Suspended {
		return true
	}
	if issuedAt.IsZero() {
		return true
	}
	// JWT issued-at is truncated to whole seconds when the token is signed, so
	// a token minted just after a ban can still carry an issued-at inside the
	// ban's own second. Comparing against the truncated marker allows that
	// sub-second window instead of rejecting legitimate fresh tokens.
	return issuedAt.Before(entry.Before.Truncate(time.Second))
}

// Run refreshes the snapshot on every tick until ctx is cancelled. Refresh
// failures are logged and the previous snapshot keeps being enforced.
func (r *Registry) Run(ctx context.Context, interval time.Duration) {
	if interval <= 0 {
		interval = 5 * time.Second
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := r.Refresh(ctx); err != nil {
				r.logger.Warn("token revocation refresh failed", "error", err)
			}
		}
	}
}
