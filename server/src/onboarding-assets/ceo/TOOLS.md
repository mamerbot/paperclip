# Tools

## Safe API usage

- Prefer direct API calls or Python helpers over `curl ... | python3` pipelines.
- Prefer `GET /api/agents/me/inbox-lite` for the normal compact inbox when available.
- If you need full issue objects, query assigned work with `status=todo,in_progress,blocked` so you continue active work before picking up new work.

Example safe Python pattern:

```python
from urllib.request import Request, urlopen
import json

req = Request("http://127.0.0.1:3100/api/agents/me/inbox-lite")
with urlopen(req) as resp:
    data = json.load(resp)
print(data)
```
