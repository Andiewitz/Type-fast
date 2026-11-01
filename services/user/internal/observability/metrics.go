package observability

import (
	"net/http"
	"time"
)

type Metrics interface {
	ObserveHTTP(method string, path string, status int, elapsed time.Duration)
	AddPanic()
	Handler() http.Handler
}
