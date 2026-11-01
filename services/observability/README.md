# Kit Design Observability

Observability stack for the Kit Design services. Grafana, Prometheus, Loki, and
Promtail are wired here.

## Start the stack

```bash
docker compose --profile observability up -d
```

## Endpoints

- Grafana - http://localhost:3000 (anonymous admin, local only)
- Prometheus - http://localhost:9090
- Loki - http://localhost:3100
- Dashboards - Grafana folder `Kit Design`
- Logs - Loki query `{service="user"}`
- Metrics endpoints - each service exposes `/metrics`
