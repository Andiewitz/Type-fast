package authorization

import (
	"context"
	"log/slog"
	"time"

	"github.com/google/uuid"

	"typefast/services/user/internal/apperr"
	"typefast/services/user/internal/audit"
	"typefast/services/user/internal/identity"
)

type Store interface {
	ListUsers(ctx context.Context, query string, limit, offset int) ([]identity.User, int, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (identity.User, error)
	SetUserStatus(ctx context.Context, id uuid.UUID, status identity.Status) (identity.User, error)
	GrantRole(ctx context.Context, userID uuid.UUID, role string) error
	RevokeRole(ctx context.Context, userID uuid.UUID, role string) error
	ListRoles(ctx context.Context) ([]identity.Role, error)
	CheckPermission(ctx context.Context, userID uuid.UUID, permission string) (bool, error)
}

// TokenRevoker keeps the local enforcement snapshot in step with a status
// change, so the replica that handled it does not wait for the next reload.
type TokenRevoker interface {
	Revoke(userID uuid.UUID, before time.Time)
	Restore(userID uuid.UUID, before time.Time)
}

type Service struct {
	store   Store
	audit   audit.Recorder
	revoker TokenRevoker
	logger  *slog.Logger
}

func NewService(store Store, recorder audit.Recorder, revoker TokenRevoker, logger *slog.Logger) *Service {
	return &Service{store: store, audit: recorder, revoker: revoker, logger: logger}
}

func (s *Service) ListUsers(ctx context.Context, query string, limit, offset int) ([]identity.User, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	return s.store.ListUsers(ctx, query, limit, offset)
}

func (s *Service) SetStatus(ctx context.Context, actorID, targetID uuid.UUID, status identity.Status, ip string) (identity.User, error) {
	if !status.Valid() || status == identity.StatusPending || status == identity.StatusDeleted {
		return identity.User{}, apperr.Invalid("Status must be active or suspended.")
	}
	if actorID == targetID && status == identity.StatusSuspended {
		return identity.User{}, apperr.Invalid("You cannot suspend your own account.")
	}
	user, err := s.store.SetUserStatus(ctx, targetID, status)
	if err != nil {
		return identity.User{}, err
	}

	if s.revoker != nil {
		var before time.Time
		if user.RevokedBefore != nil {
			before = *user.RevokedBefore
		}
		switch status {
		case identity.StatusSuspended:
			if before.IsZero() {
				before = time.Now().UTC()
			}
			s.revoker.Revoke(targetID, before)
			s.logger.Info("tokens revoked for suspended account", "user_id", targetID, "revoked_before", before)
		case identity.StatusActive:
			s.revoker.Restore(targetID, before)
			s.logger.Info("account reactivated", "user_id", targetID, "revoked_before", before)
		}
	}

	_ = s.audit.Record(ctx, audit.Event{
		ActorID:   &actorID,
		SubjectID: &targetID,
		Action:    "admin.user_status_changed",
		IP:        ip,
		Metadata:  map[string]any{"status": string(status)},
	})
	return user, nil
}

func (s *Service) GrantRole(ctx context.Context, actorID, targetID uuid.UUID, role, ip string) error {
	if role != "user" && role != "admin" {
		return apperr.Invalid("Unknown role.")
	}
	if err := s.store.GrantRole(ctx, targetID, role); err != nil {
		return err
	}
	_ = s.audit.Record(ctx, audit.Event{
		ActorID:   &actorID,
		SubjectID: &targetID,
		Action:    "admin.role_granted",
		IP:        ip,
		Metadata:  map[string]any{"role": role},
	})
	return nil
}

func (s *Service) RevokeRole(ctx context.Context, actorID, targetID uuid.UUID, role, ip string) error {
	if role != "user" && role != "admin" {
		return apperr.Invalid("Unknown role.")
	}
	if actorID == targetID && role == "admin" {
		return apperr.Invalid("You cannot remove your own admin role.")
	}
	if err := s.store.RevokeRole(ctx, targetID, role); err != nil {
		return err
	}
	_ = s.audit.Record(ctx, audit.Event{
		ActorID:   &actorID,
		SubjectID: &targetID,
		Action:    "admin.role_revoked",
		IP:        ip,
		Metadata:  map[string]any{"role": role},
	})
	return nil
}

func (s *Service) ListRoles(ctx context.Context) ([]identity.Role, error) {
	return s.store.ListRoles(ctx)
}

func (s *Service) CheckPermission(ctx context.Context, userID uuid.UUID, permission string) (bool, error) {
	if permission == "" {
		return false, apperr.Invalid("Permission is required.")
	}
	return s.store.CheckPermission(ctx, userID, permission)
}
