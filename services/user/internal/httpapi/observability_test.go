package httpapi

import (
	"bytes"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"typefast/services/user/internal/observability"
)

func TestPanicRecoveryStackOnlyInObservabilityLogs(t *testing.T) {
	t.Parallel()

	client := &bytes.Buffer{}
	recorder := httptest.NewRecorder()

	logger := slog.New(slog.NewJSONHandler(client, nil))
	server := &Server{
		logger:  logger,
		metrics: observability.NewNoopMetrics(),
	}

	handler := server.recoverer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		panic("boom")
	}))

	// Panic stack detail must be logged for observability only. Because the final
	// response is opaque to tests, use a custom body collector.
	wrapper := &responseRecorder{ResponseWriter: recorder}
	handler.ServeHTTP(wrapper, httptest.NewRequest(http.MethodPost, "/v1/auth/login", nil))

	actual := recorder.Body.String()
	if strings.Contains(actual, "boom") {
		t.Fatalf("client leaked panic detail: %s", actual)
	}
	if strings.Contains(actual, "stack_trace") {
		t.Fatalf("client leaked traceback: %s", actual)
	}

	logs := client.String()
	if logs == "" {
		t.Fatal("expected panic log")
	}
	if !strings.Contains(logs, "boom") || !strings.Contains(logs, "stack_trace") {
		t.Fatalf("missing detailed error logs: %s", logs)
	}
}

type responseRecorder struct {
	http.ResponseWriter
}

func (w *responseRecorder) Header() http.Header {
	return w.ResponseWriter.Header()
}

func (w *responseRecorder) Write(p []byte) (int, error) {
	return w.ResponseWriter.Write(p)
}

func (w *responseRecorder) WriteHeader(status int) {
	w.ResponseWriter.WriteHeader(status)
}

func TestMetricsEndpointExposesPrometheus(t *testing.T) {
	t.Parallel()

	logger := slog.New(slog.NewJSONHandler(&bytes.Buffer{}, nil))
	server := &Server{
		logger:  logger,
		metrics: observability.NewPrometheus(),
	}

	handler := server.Routes()
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/metrics", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200 for /metrics, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "kit_user_panics_total") {
		t.Fatalf("missing kit_user metric family in /metrics output")
	}
}
