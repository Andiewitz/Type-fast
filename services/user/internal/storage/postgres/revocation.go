package postgres

import (
	"context"
	"fmt"

	"typefast/services/user/internal/identity"
	"typefast/services/user/internal/revocation"
)

// ListRevocations returns the accounts whose tokens must be refused: suspended
// accounts and accounts carrying a marker from an earlier ban. Only those rows
// are read, so the poll stays cheap no matter how many users exist; deleted
// accounts are excluded because their tokens are already dead.
func (s *Store) ListRevocations(ctx context.Context) ([]revocation.Entry, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, COALESCE(revoked_before, to_timestamp(0)), status
		FROM users
		WHERE deleted_at IS NULL
		  AND (revoked_before IS NOT NULL OR status = 'suspended')
	`)
	if err != nil {
		return nil, fmt.Errorf("postgres: list token revocations: %w", err)
	}
	defer rows.Close()

	var entries []revocation.Entry
	for rows.Next() {
		var entry revocation.Entry
		var status string
		if err := rows.Scan(&entry.UserID, &entry.Before, &status); err != nil {
			return nil, fmt.Errorf("postgres: scan token revocation: %w", err)
		}
		entry.Suspended = identity.Status(status) == identity.StatusSuspended
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres: list token revocations: %w", err)
	}
	return entries, nil
}
