package userint

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/google/uuid"

	"typefast/services/user/internal/revocation"
)

// waitPastSecondBoundary crosses a whole second so a ban is unambiguously newer
// than a token that was just issued: JWT issued-at has one-second resolution.
func waitPastSecondBoundary() {
	next := time.Now().Truncate(time.Second).Add(time.Second)
	time.Sleep(time.Until(next) + 20*time.Millisecond)
}

// A ban must land on the very next request, on every authenticated surface,
// and must beat permission checks rather than surfacing as a 403.
func TestBanRevokesAccessTokenImmediately(t *testing.T) {
	h := newHarness(t)
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	member := h.registerAndVerify(t, "member@example.com", password)
	memberToken := h.login(t, member.Email, password)
	waitPastSecondBoundary()

	if before := h.request(t, http.MethodGet, "/v1/account", nil, memberToken.AccessToken); before.status != http.StatusOK {
		t.Fatalf("pre-ban account status = %d: %s", before.status, before.body)
	}

	suspend := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken)
	if suspend.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", suspend.status, suspend.body)
	}

	userID, err := uuid.Parse(member.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !h.revocations.TokenRevoked(userID, time.Now().UTC().Add(-time.Minute)) {
		t.Fatal("the banning replica must enforce the ban without waiting for a refresh")
	}

	attempts := []struct {
		name   string
		method string
		path   string
		body   any
	}{
		{"account read", http.MethodGet, "/v1/account", nil},
		{"account update", http.MethodPatch, "/v1/account", map[string]string{"display_name": "Banned"}},
		{"session list", http.MethodGet, "/v1/account/sessions", nil},
		{"account events", http.MethodGet, "/v1/account/events", nil},
		{"logout", http.MethodPost, "/v1/auth/logout", nil},
	}
	for _, attempt := range attempts {
		result := h.request(t, attempt.method, attempt.path, attempt.body, memberToken.AccessToken)
		if result.status != http.StatusUnauthorized {
			t.Fatalf("%s status = %d, want 401: %s", attempt.name, result.status, result.body)
		}
		var problem problemPayload
		decode(t, result.body, &problem)
		if problem.Code != "token_revoked" {
			t.Fatalf("%s code = %q, want token_revoked", attempt.name, problem.Code)
		}
	}

	// A banned admin is rejected as unauthenticated, not forbidden.
	bannedAdmin := h.adminToken(t, "second-admin@example.com", password)
	waitPastSecondBoundary()
	bannedAdminID, err := uuid.Parse(bannedAdmin.User.ID)
	if err != nil {
		t.Fatal(err)
	}
	if bannedAdminID == userID {
		t.Fatal("expected a distinct admin account")
	}
	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+bannedAdmin.User.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend admin status = %d: %s", result.status, result.body)
	}
	adminAttempt := h.request(t, http.MethodGet, "/v1/admin/users", nil, bannedAdmin.AccessToken)
	if adminAttempt.status != http.StatusUnauthorized {
		t.Fatalf("banned admin status = %d, want 401: %s", adminAttempt.status, adminAttempt.body)
	}
	var problem problemPayload
	decode(t, adminAttempt.body, &problem)
	if problem.Code != "token_revoked" {
		t.Fatalf("banned admin code = %q, want token_revoked", problem.Code)
	}
}

// A ban also has to close the routes that do not use a bearer token.
func TestBanBlocksRefreshAndLogin(t *testing.T) {
	h := newHarness(t)
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	member := h.registerAndVerify(t, "member@example.com", password)
	h.login(t, member.Email, password)
	refreshCookie := h.refreshCookie(t)

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", result.status, result.body)
	}

	refresh := h.refresh(t, refreshCookie)
	if refresh.status != http.StatusUnauthorized {
		t.Fatalf("refresh status = %d, want 401: %s", refresh.status, refresh.body)
	}
	var refreshProblem problemPayload
	decode(t, refresh.body, &refreshProblem)
	if refreshProblem.Code != "invalid_token" {
		t.Fatalf("refresh code = %q, want invalid_token", refreshProblem.Code)
	}

	login := h.request(t, http.MethodPost, "/v1/auth/login", map[string]string{"email": member.Email, "password": password}, "")
	if login.status != http.StatusForbidden {
		t.Fatalf("banned login status = %d, want 403: %s", login.status, login.body)
	}
	var loginProblem problemPayload
	decode(t, login.body, &loginProblem)
	if loginProblem.Code != "account_not_active" {
		t.Fatalf("banned login code = %q, want account_not_active", loginProblem.Code)
	}
}

func TestBanLeavesOtherAccountsWorking(t *testing.T) {
	h := newHarness(t)
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	banned := h.registerAndVerify(t, "banned@example.com", password)
	bystander := h.registerAndVerify(t, "bystander@example.com", password)
	bystanderToken := h.login(t, bystander.Email, password)

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+banned.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", result.status, result.body)
	}

	if result := h.request(t, http.MethodGet, "/v1/account", nil, bystanderToken.AccessToken); result.status != http.StatusOK {
		t.Fatalf("bystander status = %d, want 200: %s", result.status, result.body)
	}
	if result := h.request(t, http.MethodGet, "/v1/account", nil, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("admin status = %d, want 200: %s", result.status, result.body)
	}
}

// Reactivation restores sign-in but must not resurrect tokens from before the ban.
func TestReactivationKeepsPreBanTokensDead(t *testing.T) {
	h := newHarness(t)
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	member := h.registerAndVerify(t, "member@example.com", password)
	oldToken := h.login(t, member.Email, password)
	waitPastSecondBoundary()

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", result.status, result.body)
	}
	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "active"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("activate status = %d: %s", result.status, result.body)
	}

	stale := h.request(t, http.MethodGet, "/v1/account", nil, oldToken.AccessToken)
	if stale.status != http.StatusUnauthorized {
		t.Fatalf("pre-ban token status = %d, want 401: %s", stale.status, stale.body)
	}
	var problem problemPayload
	decode(t, stale.body, &problem)
	if problem.Code != "token_revoked" {
		t.Fatalf("pre-ban token code = %q, want token_revoked", problem.Code)
	}

	fresh := h.login(t, member.Email, password)
	if result := h.request(t, http.MethodGet, "/v1/account", nil, fresh.AccessToken); result.status != http.StatusOK {
		t.Fatalf("post-ban login status = %d, want 200: %s", result.status, result.body)
	}
}

// A replica that only polls must still learn about a ban written elsewhere.
func TestBanReachesAnotherReplica(t *testing.T) {
	h := newHarness(t)
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	member := h.registerAndVerify(t, "member@example.com", password)
	h.login(t, member.Email, password)

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", result.status, result.body)
	}

	userID, err := uuid.Parse(member.ID)
	if err != nil {
		t.Fatal(err)
	}

	follower := revocation.NewRegistry(h.store, nil)
	if err := follower.Refresh(context.Background()); err != nil {
		t.Fatalf("follower refresh: %v", err)
	}
	if !follower.TokenRevoked(userID, time.Now().UTC().Add(-time.Minute)) {
		t.Fatal("a polling replica must reject tokens issued before the ban")
	}
	if follower.TokenRevoked(userID, time.Now().UTC().Add(time.Hour)) {
		t.Fatal("a polling replica must accept tokens issued after the ban")
	}
}

// The database has to record the ban, revoke sessions, and keep the marker
// after reactivation so old tokens stay invalid.
func TestBanRecordsRevocationState(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	password := "correct horse battery staple"

	admin := h.adminToken(t, "admin@example.com", password)
	member := h.registerAndVerify(t, "member@example.com", password)
	h.login(t, member.Email, password)

	userID, err := uuid.Parse(member.ID)
	if err != nil {
		t.Fatal(err)
	}

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "suspended"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("suspend status = %d: %s", result.status, result.body)
	}

	var status string
	var revokedBefore *time.Time
	if err := h.pool.QueryRow(ctx, `SELECT status, revoked_before FROM users WHERE id = $1`, userID).Scan(&status, &revokedBefore); err != nil {
		t.Fatal(err)
	}
	if status != "suspended" {
		t.Fatalf("status = %q, want suspended", status)
	}
	if revokedBefore == nil {
		t.Fatal("expected a revocation marker")
	}

	var activeSessions int
	if err := h.pool.QueryRow(ctx, `SELECT count(*) FROM sessions WHERE user_id = $1 AND revoked_at IS NULL`, userID).Scan(&activeSessions); err != nil {
		t.Fatal(err)
	}
	if activeSessions != 0 {
		t.Fatalf("active sessions after ban = %d, want 0", activeSessions)
	}

	if result := h.request(t, http.MethodPatch, "/v1/admin/users/"+member.ID+"/status", map[string]string{"status": "active"}, admin.AccessToken); result.status != http.StatusOK {
		t.Fatalf("activate status = %d: %s", result.status, result.body)
	}

	var retained *time.Time
	if err := h.pool.QueryRow(ctx, `SELECT revoked_before FROM users WHERE id = $1`, userID).Scan(&retained); err != nil {
		t.Fatal(err)
	}
	if retained == nil || !retained.Equal(*revokedBefore) {
		t.Fatalf("revocation marker after activation = %v, want %v", retained, revokedBefore)
	}
}
