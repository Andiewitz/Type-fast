package identity

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusPending   Status = "pending"
	StatusActive    Status = "active"
	StatusSuspended Status = "suspended"
	StatusDeleted   Status = "deleted"
)

func (s Status) Valid() bool {
	switch s {
	case StatusPending, StatusActive, StatusSuspended, StatusDeleted:
		return true
	default:
		return false
	}
}

// PasswordHashExternal marks an account whose credentials are managed by an
// external identity provider. It is not a valid password hash, so local
// password login always fails for these accounts.
const PasswordHashExternal = "!external-identity"

type User struct {
	ID              uuid.UUID
	Email           string
	CognitoSub      string
	PasswordHash    string
	Status          Status
	DisplayName     string
	EmailVerifiedAt *time.Time
	LastLoginAt     *time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
	RevokedBefore   *time.Time
}

type Role struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
