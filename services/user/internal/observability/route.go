package observability

import "strings"

func RouteLabel(path string) string {
	switch {
	case strings.HasPrefix(path, "/healthz"), strings.HasPrefix(path, "/readyz"):
		return "health"
	case strings.HasPrefix(path, "/v1/auth/register"),
		strings.HasPrefix(path, "/v1/auth/email"),
		strings.HasPrefix(path, "/v1/auth/password"):
		return "auth_user"
	case strings.HasPrefix(path, "/v1/auth/login"),
		strings.HasPrefix(path, "/v1/auth/refresh"),
		strings.HasPrefix(path, "/v1/auth/logout"):
		return "auth_session"
	case strings.HasPrefix(path, "/v1/account"):
		return "account"
	case strings.HasPrefix(path, "/v1/admin"):
		return "admin"
	case strings.HasPrefix(path, "/internal"):
		return "internal"
	case strings.HasPrefix(path, "/metrics"):
		return "metrics"
	default:
		return "other"
	}
}
