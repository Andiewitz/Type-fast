package observability

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type prometheusMetrics struct {
	registry            *prometheus.Registry
	httpRequestsTotal   *prometheus.CounterVec
	httpRequestDuration *prometheus.HistogramVec
	panicsTotal         prometheus.Counter
}

func NewPrometheus() Metrics {
	httpRequestsTotal := prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Namespace: "kit",
			Subsystem: "user",
			Name:      "http_requests_total",
			Help:      "Total number of user service HTTP requests.",
		},
		[]string{"method", "path", "status"},
	)
	httpRequestDuration := prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Namespace: "kit",
			Subsystem: "user",
			Name:      "http_request_duration_seconds",
			Help:      "User service HTTP request latency.",
			Buckets:   []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		},
		[]string{"method", "path"},
	)
	panicsTotal := prometheus.NewCounter(
		prometheus.CounterOpts{
			Namespace: "kit",
			Subsystem: "user",
			Name:      "panics_total",
			Help:      "Total number of recovered panics in the user service.",
		},
	)

	registry := prometheus.NewRegistry()
	registry.MustRegister(httpRequestsTotal, httpRequestDuration, panicsTotal)

	return &prometheusMetrics{
		registry:            registry,
		httpRequestsTotal:   httpRequestsTotal,
		httpRequestDuration: httpRequestDuration,
		panicsTotal:         panicsTotal,
	}
}

func (m *prometheusMetrics) ObserveHTTP(method string, path string, status int, elapsed time.Duration) {
	route := RouteLabel(path)
	m.httpRequestsTotal.WithLabelValues(method, route, strconv.Itoa(status)).Inc()
	m.httpRequestDuration.WithLabelValues(method, route).Observe(elapsed.Seconds())
}

func (m *prometheusMetrics) AddPanic() {
	m.panicsTotal.Inc()
}

func (m *prometheusMetrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.registry, promhttp.HandlerOpts{})
}
