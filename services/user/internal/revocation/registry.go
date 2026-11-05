// Package revocation decides whether an access token has been invalidated by a
// ban or a forced sign-out.
//
// Access tokens are signed and verified offline, so nothing can recall one
// after it is issued. Instead the service keeps a small in-memory snapshot of
// accounts that were revoked, refreshed from storage on a timer. A request is
// rejected when its token was issued at or before that account's marker.
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

// Entry is one account's revocation marker: tokens issued at or before Before
// are no longer accepted.
type Entry struct {
	UserID uuid.UUID
	Before time.Time
}

// Source loads the current set of revoked accounts.
type Source interface {
	ListRevocations(ctx context.Context) ([]Entry, error)
}

// Registry is a concurrency-safe snapshot of revoked accounts.
type Registry struct {
	mu      sync.RWMutex
	revoked map[uuid.UUID]time.Time
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
		revoked: make(map[uuid.UUID]time.Time),
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

	next := make(map[uuid.UUID]time.Time, len(entries))
	for _, entry := range entries {
		next[entry.UserID] = entry.Before
	}

	r.mu.Lock()
	r.revoked = next
	r.mu.Unlock()
	return nil
}

// Revoke records a ban locally so the replica that wrote it enforces the ban on
// the next request instead of waiting for the next refresh. The latest marker
// wins, so an older timestamp can never shorten an existing ban.
func (r *Registry) Revoke(userID uuid.UUID, before time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if existing, ok := r.revoked[userID]; ok && existing.After(before) {
		before = existing
	}
	r.revoked[userID] = before
}

// TokenRevoked reports whether a token issued at issuedAt must be rejected.
// A zero issuedAt is treated as revoked: without a timestamp there is no way to
// prove the token postdates the ban.
func (r *Registry) TokenRevoked(userID uuid.UUID, issuedAt time.Time) bool {
	r.mu.RLock()
	before, ok := r.revoked[userID]
	r.mu.RUnlock()
	if !ok {
		return false
	}
	if issuedAt.IsZero() {
		return true
	}
	// JWT issued-at is truncated to whole seconds when the token is signed, so
	// a token minted just after a ban can still carry an issued-at inside the
	// ban's own second. Comparing against the truncated marker allows that
	// sub-second window instead of rejecting legitimate fresh tokens.
	return issuedAt.Before(before.Truncate(time.Second))
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
