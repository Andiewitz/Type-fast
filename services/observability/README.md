# Type Fast Observability

Observability stack for the Type Fast services. Grafana, Prometheus, Loki, and
Promtail are wired here.

## Start the stack

```bash
docker compose --profile observability up -d
```

## Endpoints

- Grafana - http://localhost:3000 (anonymous admin, local only)
- Prometheus - http://localhost:9090
- Loki - http://localhost:3100
- Dashboards - Grafana folder `Type Fast`
- Logs - Loki query `{service="user"}`
- Metrics endpoints - each service exposes `/metrics`
