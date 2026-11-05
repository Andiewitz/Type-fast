package userint

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"typefast/services/user/internal/apperr"
	"typefast/services/user/internal/identity"
)

func TestCognitoStoreCreatesVerifiedUser(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	sub := "sub-" + uuid.NewString()

	user, err := h.store.CreateUserFromCognito(ctx, identity.User{Email: "cognito@example.com"}, "  "+sub+"  ")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	if user.ID == uuid.Nil {
		t.Fatal("expected generated user id")
	}
	if user.CognitoSub != sub {
		t.Fatalf("cognito sub = %q, want trimmed %q", user.CognitoSub, sub)
	}
	if user.Status != identity.StatusActive {
		t.Fatalf("status = %q, want active", user.Status)
	}
	if user.PasswordHash != identity.PasswordHashExternal {
		t.Fatalf("password hash = %q, want the external marker", user.PasswordHash)
	}
	if user.EmailVerifiedAt == nil || user.EmailVerifiedAt.IsZero() {
		t.Fatal("expected an email verification timestamp")
	}
	if user.CreatedAt.IsZero() || user.UpdatedAt.Before(user.CreatedAt) {
		t.Fatalf("timestamps = created %v updated %v", user.CreatedAt, user.UpdatedAt)
	}

	stored, err := h.store.GetUserByCognitoSub(ctx, sub)
	if err != nil {
		t.Fatalf("get by sub: %v", err)
	}
	if stored.ID != user.ID || stored.Email != "cognito@example.com" {
		t.Fatalf("stored user = %+v, want id %s", stored, user.ID)
	}
}

func TestCognitoStoreRejectsDuplicateIdentity(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	sub := "sub-" + uuid.NewString()

	if _, err := h.store.CreateUserFromCognito(ctx, identity.User{Email: "first@example.com"}, sub); err != nil {
		t.Fatalf("create first user: %v", err)
	}

	_, err := h.store.CreateUserFromCognito(ctx, identity.User{Email: "second@example.com"}, sub)
	if !apperr.IsKind(err, apperr.KindConflict) || apperr.Code(err) != "cognito_sub_taken" {
		t.Fatalf("duplicate sub error = %v, want conflict cognito_sub_taken", err)
	}

	_, err = h.store.CreateUserFromCognito(ctx, identity.User{Email: "first@example.com"}, "other-"+sub)
	if !apperr.IsKind(err, apperr.KindConflict) || apperr.Code(err) != "email_exists" {
		t.Fatalf("duplicate email error = %v, want conflict email_exists", err)
	}

	linked, err := h.store.GetUserByCognitoSub(ctx, sub)
	if err != nil {
		t.Fatalf("original mapping lost: %v", err)
	}
	if linked.Email != "first@example.com" {
		t.Fatalf("original mapping email = %q", linked.Email)
	}
}

func TestCognitoStoreLookupBySubject(t *testing.T) {
	h := newHarness(t)

	_, err := h.store.GetUserByCognitoSub(t.Context(), "missing-"+uuid.NewString())
	if !apperr.IsKind(err, apperr.KindNotFound) || apperr.Code(err) != "cognito_identity_not_found" {
		t.Fatalf("unknown sub error = %v, want not found cognito_identity_not_found", err)
	}

	_, err = h.store.GetUserByCognitoSub(t.Context(), "   ")
	if !apperr.IsKind(err, apperr.KindValidation) {
		t.Fatalf("blank sub error = %v, want validation", err)
	}

	_, err = h.store.CreateUserFromCognito(t.Context(), identity.User{}, "sub-"+uuid.NewString())
	if !apperr.IsKind(err, apperr.KindValidation) {
		t.Fatalf("blank email error = %v, want validation", err)
	}
}

func TestCognitoStoreIgnoresSoftDeletedUsers(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	sub := "sub-" + uuid.NewString()

	user, err := h.store.CreateUserFromCognito(ctx, identity.User{Email: "deleted@example.com"}, sub)
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if _, err := h.pool.Exec(ctx, `UPDATE users SET deleted_at = now() WHERE id = $1`, user.ID); err != nil {
		t.Fatal(err)
	}

	_, err = h.store.GetUserByCognitoSub(ctx, sub)
	if !apperr.IsKind(err, apperr.KindNotFound) || apperr.Code(err) != "cognito_identity_not_found" {
		t.Fatalf("deleted lookup error = %v, want not found cognito_identity_not_found", err)
	}

	_, err = h.store.LinkCognitoSub(ctx, user.ID, "another-"+sub)
	if !apperr.IsKind(err, apperr.KindNotFound) || apperr.Code(err) != "user_not_found" {
		t.Fatalf("deleted link error = %v, want not found user_not_found", err)
	}
}

func TestCognitoStoreLinksExistingUser(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	password := "correct horse battery staple"
	sub := "sub-" + uuid.NewString()

	local := h.registerAndVerify(t, "local@example.com", password)
	userID, err := uuid.Parse(local.ID)
	if err != nil {
		t.Fatal(err)
	}

	linked, err := h.store.LinkCognitoSub(ctx, userID, sub)
	if err != nil {
		t.Fatalf("link: %v", err)
	}
	if linked.ID != userID || linked.CognitoSub != sub {
		t.Fatalf("linked user = %+v", linked)
	}
	if linked.PasswordHash == identity.PasswordHashExternal {
		t.Fatal("linking must not replace an existing local password")
	}

	again, err := h.store.LinkCognitoSub(ctx, userID, sub)
	if err != nil {
		t.Fatalf("relink same sub should be idempotent: %v", err)
	}
	if again.CognitoSub != sub {
		t.Fatalf("relink sub = %q", again.CognitoSub)
	}

	other := h.registerAndVerify(t, "other@example.com", password)
	otherID, err := uuid.Parse(other.ID)
	if err != nil {
		t.Fatal(err)
	}
	_, err = h.store.LinkCognitoSub(ctx, otherID, sub)
	if !apperr.IsKind(err, apperr.KindConflict) || apperr.Code(err) != "cognito_sub_taken" {
		t.Fatalf("second claim error = %v, want conflict cognito_sub_taken", err)
	}

	_, err = h.store.LinkCognitoSub(ctx, userID, "different-"+sub)
	if !apperr.IsKind(err, apperr.KindConflict) || apperr.Code(err) != "cognito_sub_already_linked" {
		t.Fatalf("repoint error = %v, want conflict cognito_sub_already_linked", err)
	}

	_, err = h.store.LinkCognitoSub(ctx, uuid.New(), sub)
	if !apperr.IsKind(err, apperr.KindNotFound) || apperr.Code(err) != "user_not_found" {
		t.Fatalf("unknown user error = %v, want not found user_not_found", err)
	}

	localLogin := h.login(t, "local@example.com", password)
	if localLogin.AccessToken == "" {
		t.Fatal("linked user must still be able to log in locally")
	}
}
