# Observability tests

Grafana, Prometheus, Loki, and Promtail are best exercised through the Compose
profile because they depend on live infrastructure.

## Quick checks

```bash
docker compose config --profile observability
docker compose --profile observability up -d
curl -sf http://localhost:3001/metrics | rg '^# HELP'
curl -sf http://localhost:9090/-/ready
curl -sf http://localhost:3100/ready
```

Grafana can be inspected at http://localhost:3000. The dashboard is under the
`Kit Design` folder.

## Safety

Detailed traceback/stack information is never returned to HTTP callers. It is
deliberately kept in structured logs that the observability stack ingests.
