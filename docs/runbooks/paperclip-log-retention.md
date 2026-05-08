# Paperclip log retention on Raven

This runbook captures the verified Paperclip log-retention policy on Raven for EMT-48.

## Scope

Paperclip emits logs to three places:

1. Journald for `paperclip.service` stdout/stderr
2. File-backed application and monitoring logs under `~/.paperclip`
3. Immutable per-run NDJSON logs under `~/.paperclip/instances/default/data/run-logs`

## Live config paths

### Journald-owned service logs

- Unit: `~/.config/systemd/user/paperclip.service`
- Discovery: `journalctl --user -u paperclip.service`
- Current service routing: `StandardOutput=journal`, `StandardError=journal`

Paperclip service output stays in journald; do not add duplicate flat-file service logging.

### File-backed logs rotated daily with 7 retained archives

- Logrotate config: `~/.config/logrotate.d/paperclip`
- State file: `~/.paperclip/monitoring/state/logrotate.status`
- Timer/service:
  - `~/.config/systemd/user/paperclip-log-maintenance.timer`
  - `~/.config/systemd/user/paperclip-log-maintenance.service`

Covered files:

- `~/.paperclip/instances/default/logs/server.log`
- `~/.paperclip/monitoring/state/*.log`

Policy:

- `daily`
- `rotate 7`
- `compress`
- `delaycompress`
- `copytruncate`
- `missingok`
- `notifempty`

### Run-log retention

Run logs are immutable per-run `.ndjson` files, so retention is enforced by pruning rather than rotation.

- Prune script: `~/.paperclip/monitoring/prune-run-logs.py`
- Root pruned: `~/.paperclip/instances/default/data/run-logs`
- Retention window: `7` days
- Execution path: `paperclip-log-maintenance.service`

## Why this exists

The previously discovered host-local logrotate snippet was not sufficient as a durable policy because:

- it lived outside the system logrotate include path
- it contained a duplicate/invalid fallback stanza
- monitoring state logs were not covered
- run-log retention older than 7 days was not enforced

The daily `paperclip-log-maintenance.timer` closes those gaps without changing Paperclip request handling.

## Verification commands

```sh
systemctl --user list-timers --all --no-pager | grep paperclip-log-maintenance
systemctl --user cat paperclip-log-maintenance.service
/usr/sbin/logrotate -d -s ~/.paperclip/monitoring/state/logrotate.status ~/.config/logrotate.d/paperclip
python3 ~/.paperclip/monitoring/prune-run-logs.py --retention-days 7
find ~/.paperclip/instances/default/data/run-logs -name '*.ndjson' -mtime +7 | head
python3 - <<'PY'
import urllib.request
print(urllib.request.urlopen('http://127.0.0.1:3100/api/health', timeout=10).read().decode())
PY
```

## Verified live on 2026-05-02

- `paperclip-log-maintenance.timer` scheduled daily and enabled
- `paperclip-log-maintenance.service` successfully ran logrotate plus run-log pruning
- `server.log` rotated and truncated cleanly while `paperclip.service` remained healthy
- run logs older than 7 days were pruned to zero remaining files beyond the retention window
- `http://127.0.0.1:3100/api/health` returned `200` after maintenance
