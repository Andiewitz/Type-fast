package observability

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestPrometheusMetricsHandler(t *testing.T) {
	t.Parallel()

	metrics := NewPrometheus()
	metrics.ObserveHTTP(http.MethodGet, "/v1/auth/login", http.StatusOK, 25*time.Millisecond)
	metrics.ObserveHTTP(http.MethodGet, "/v1/auth/login", http.StatusInternalServerError, 50*time.Millisecond)
	metrics.AddPanic()

	server := httptest.NewServer(metrics.Handler())
	defer server.Close()

	response, err := http.Get(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", response.StatusCode)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}
	text := string(body)
	expected := []string{
		"kit_user_http_requests_total{method=\"GET\",path=\"auth_session\",status=\"200\"}",
		"kit_user_http_requests_total{method=\"GET\",path=\"auth_session\",status=\"500\"}",
		"kit_user_panics_total",
	}
	for _, needle := range expected {
		if !strings.Contains(text, needle) {
			t.Fatalf("metrics body missing %q\n\n%s", needle, text)
		}
	}
}
