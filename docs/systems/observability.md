# Observability

Location: `services/observability`

Runtime: Docker Compose

Stack: Prometheus 3.15, Grafana 13, Loki 3.7, Promtail 3.6

> Note: Promtail is end of life as of March 2, 2026. The stack pins the last
> available release, 3.6.11. There is no newer Promtail image tag. Future
> migration should move log collection to Grafana Alloy.

## Responsibilities

The observability stack is the only place where detailed diagnostics are meant
to be consumed. It keeps Prometheus metrics, structured logs, and Grafana
dashboards for the Kit Design services.

## Layout

```text
services/observability/
  prometheus/     Prometheus configuration
  loki/           Loki configuration
  promtail/       Promtail log collection configuration
  grafana/        Grafana provisioning and dashboards
```

Docker Compose profile:

```bash
docker compose --profile observability up -d
```

## Endpoints

| Component | Endpoint |
| --- | --- |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Loki | http://localhost:3100 |
| Metrics feed | each container `/metrics` |
| Dashboard folder | General (default home) |

All observability endpoints are bound to `127.0.0.1` by default.

## Error tracing

The user service keeps client-facing error responses generic. Detailed context
such as raw stack traces only goes into structured logs that Grafana consumes.

- HTTP Problem JSON responses do not expose stack traces.
- Panics and other unexpected failures are logged with a `stack_trace` field.
- Every log record carries a request ID.
- Prometheus makes it possible to alert and inspect aggregate error counts.
- Loki/Grafana provide the underlying message detail.
