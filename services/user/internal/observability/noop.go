package observability

import (
	"net/http"
	"time"
)

type NoopMetrics struct{}

func NewNoopMetrics() Metrics {
	return NoopMetrics{}
}

func (NoopMetrics) ObserveHTTP(string, string, int, time.Duration) {}
func (NoopMetrics) AddPanic()                                      {}
func (NoopMetrics) Handler() http.Handler                          { return http.NotFoundHandler() }
