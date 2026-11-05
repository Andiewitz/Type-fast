package postgres

import (
	"context"
	"fmt"

	"typefast/services/user/internal/revocation"
)

// ListRevocations returns the accounts whose tokens have been invalidated.
// Only marked rows are read, so the poll stays cheap no matter how many users
// exist; deleted accounts are excluded because their tokens are already dead.
func (s *Store) ListRevocations(ctx context.Context) ([]revocation.Entry, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, revoked_before
		FROM users
		WHERE revoked_before IS NOT NULL
		  AND deleted_at IS NULL
	`)
	if err != nil {
		return nil, fmt.Errorf("postgres: list token revocations: %w", err)
	}
	defer rows.Close()

	var entries []revocation.Entry
	for rows.Next() {
		var entry revocation.Entry
		if err := rows.Scan(&entry.UserID, &entry.Before); err != nil {
			return nil, fmt.Errorf("postgres: scan token revocation: %w", err)
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres: list token revocations: %w", err)
	}
	return entries, nil
}
