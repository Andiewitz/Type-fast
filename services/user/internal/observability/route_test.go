package observability

import (
	"testing"
)

func TestRouteLabel(t *testing.T) {
	t.Parallel()

	tests := []struct {
		input    string
		expected string
	}{
		{input: "/healthz", expected: "health"},
		{input: "/readyz", expected: "health"},
		{input: "/v1/auth/login", expected: "auth_session"},
		{input: "/v1/auth/register", expected: "auth_user"},
		{input: "/v1/account", expected: "account"},
		{input: "/v1/admin/users/1", expected: "admin"},
		{input: "/internal/v1/authz/check", expected: "internal"},
		{input: "/metrics", expected: "metrics"},
		{input: "/other", expected: "other"},
	}

	for _, test := range tests {
		t.Run(test.input, func(t *testing.T) {
			if got := RouteLabel(test.input); got != test.expected {
				t.Fatalf("got %q, want %q", got, test.expected)
			}
		})
	}
}
