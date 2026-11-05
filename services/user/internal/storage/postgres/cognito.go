package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"typefast/services/user/internal/apperr"
	"typefast/services/user/internal/identity"
)

// Cognito is the only public identity provider, so every Cognito subject maps
// to at most one row in users. These queries are the only place the mapping is
// read or written; the unique index users_cognito_sub_key enforces it.

// CreateUserFromCognito inserts a local user already verified by Cognito and
// links the subject in one statement. It returns the stored row.
//
// Zero values are defaulted: ID becomes a new UUIDv7, Status becomes active,
// PasswordHash becomes identity.PasswordHashExternal, EmailVerifiedAt becomes
// now, and CreatedAt/UpdatedAt become now.
//
// Errors:
//   - KindValidation: blank subject or email, or an unknown status.
//   - KindConflict "cognito_sub_taken": the subject is linked to another user.
//   - KindConflict "email_exists": the email belongs to another account.
func (s *Store) CreateUserFromCognito(ctx context.Context, user identity.User, rawSub string) (identity.User, error) {
	sub, err := normalizeCognitoSub(rawSub)
	if err != nil {
		return identity.User{}, err
	}
	if strings.TrimSpace(user.Email) == "" {
		return identity.User{}, apperr.Invalid("email is required")
	}
	if user.Status == "" {
		user.Status = identity.StatusActive
	}
	if !user.Status.Valid() {
		return identity.User{}, apperr.Invalid("status is invalid")
	}
	if user.PasswordHash == "" {
		user.PasswordHash = identity.PasswordHashExternal
	}
	if user.ID == uuid.Nil {
		user.ID = uuid.Must(uuid.NewV7())
	}

	now := time.Now().UTC()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	user.UpdatedAt = now
	if user.EmailVerifiedAt == nil {
		user.EmailVerifiedAt = &now
	}

	stored, err := scanUser(s.pool.QueryRow(ctx, `
		INSERT INTO users (id, email, password_hash, status, display_name, email_verified_at, created_at, updated_at, cognito_sub)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING `+userColumns,
		user.ID, user.Email, user.PasswordHash, string(user.Status), user.DisplayName,
		user.EmailVerifiedAt, user.CreatedAt, user.UpdatedAt, sub,
	))
	if err != nil {
		switch {
		case isConstraintViolation(err, usersCognitoSubKey):
			return identity.User{}, apperr.Conflict("cognito_sub_taken")
		case isConstraintViolation(err, usersEmailKey):
			return identity.User{}, apperr.Conflict("email_exists")
		default:
			return identity.User{}, fmt.Errorf("postgres: create user for cognito sub %q: %w", sub, err)
		}
	}
	return stored, nil
}

// GetUserByCognitoSub returns the user linked to a Cognito subject.
//
// Errors:
//   - KindValidation: blank subject.
//   - KindNotFound "cognito_identity_not_found": no live user is linked to it.
func (s *Store) GetUserByCognitoSub(ctx context.Context, rawSub string) (identity.User, error) {
	sub, err := normalizeCognitoSub(rawSub)
	if err != nil {
		return identity.User{}, err
	}

	user, err := scanUser(s.pool.QueryRow(ctx, `
		SELECT `+userColumns+`
		FROM users
		WHERE cognito_sub = $1 AND deleted_at IS NULL
	`, sub))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return identity.User{}, apperr.NotFound("cognito_identity_not_found")
		}
		return identity.User{}, fmt.Errorf("postgres: get user for cognito sub %q: %w", sub, err)
	}
	return user, nil
}

// LinkCognitoSub links an existing local user to a Cognito subject and returns
// the updated row. Linking the same subject twice is a no-op.
//
// Errors:
//   - KindValidation: blank subject or missing user ID.
//   - KindNotFound "user_not_found": the account does not exist or is deleted.
//   - KindConflict "cognito_sub_taken": the subject belongs to another user.
//   - KindConflict "cognito_sub_already_linked": the user is linked to a
//     different subject and must not be silently re-pointed.
func (s *Store) LinkCognitoSub(ctx context.Context, userID uuid.UUID, rawSub string) (identity.User, error) {
	sub, err := normalizeCognitoSub(rawSub)
	if err != nil {
		return identity.User{}, err
	}
	if userID == uuid.Nil {
		return identity.User{}, apperr.Invalid("user_id is required")
	}

	user, err := scanUser(s.pool.QueryRow(ctx, `
		UPDATE users
		SET cognito_sub = $2, updated_at = $3
		WHERE id = $1
		  AND deleted_at IS NULL
		  AND (cognito_sub IS NULL OR cognito_sub = $2)
		RETURNING `+userColumns,
		userID, sub, time.Now().UTC(),
	))
	if err == nil {
		return user, nil
	}
	if isConstraintViolation(err, usersCognitoSubKey) {
		return identity.User{}, apperr.Conflict("cognito_sub_taken")
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return identity.User{}, fmt.Errorf("postgres: link cognito sub to user %s: %w", userID, err)
	}

	// Nothing was updated; explain why rather than returning a bare no-rows.
	var linkedSub *string
	err = s.pool.QueryRow(ctx, `
		SELECT cognito_sub FROM users WHERE id = $1 AND deleted_at IS NULL
	`, userID).Scan(&linkedSub)
	if errors.Is(err, pgx.ErrNoRows) {
		return identity.User{}, apperr.NotFound("user_not_found")
	}
	if err != nil {
		return identity.User{}, fmt.Errorf("postgres: inspect user %s while linking cognito sub: %w", userID, err)
	}
	if linkedSub != nil && *linkedSub != "" {
		return identity.User{}, apperr.Conflict("cognito_sub_already_linked")
	}
	return identity.User{}, fmt.Errorf("postgres: link cognito sub to user %s: no row updated", userID)
}

// normalizeCognitoSub trims the subject Cognito issues and rejects blanks so a
// missing claim can never be stored as an empty identity.
func normalizeCognitoSub(raw string) (string, error) {
	sub := strings.TrimSpace(raw)
	if sub == "" {
		return "", apperr.Invalid("cognito_sub is required")
	}
	return sub, nil
}
