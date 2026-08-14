# Verify Skill — AI Financial Adviser

## Surface
Next.js Route Handlers (HTTP API). No GUI to drive. Hit the API routes directly.

## Build & Launch
```powershell
# From repo root — pick an unused port to avoid conflicts
$env:PORT = "3099"
npm run dev
# Wait for: "✓ Ready in Xs" in the log
```

Dev server uses Turbopack. First-hit compile of a cold route takes 10-15s.

## Drive the Routes

Three AI routes live at `/api/parse-csv`, `/api/insights`, `/api/categorize`.

All require a Supabase Bearer token. Without a live token, the auth guard fires first.

**Smoke test (no creds needed) — confirms handler loads and executes:**
```bash
curl -s -X POST http://localhost:3099/api/parse-csv \
  -H "Content-Type: application/json" -d '{}'
# Expect: {"error":"Unauthorized"} HTTP 401

curl -s -X POST http://localhost:3099/api/insights \
  -H "Content-Type: application/json" -d '{}'
# Expect: {"error":"Unauthorized"} HTTP 401

curl -s -X POST http://localhost:3099/api/categorize \
  -H "Content-Type: application/json" -d '{}'
# Expect: {"error":"Unauthorized"} HTTP 401
```

A 401 body proves the module imported and handler code ran. A 500 with a module error means the SDK import failed.

**Wrong method probe:**
```bash
curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3099/api/parse-csv
# Expect: 405
```

**With fake Bearer (hits Supabase auth, ~100-1600ms):**
```bash
curl -s -X POST http://localhost:3099/api/parse-csv \
  -H "Authorization: Bearer faketoken" \
  -H "Content-Type: application/json" -d '{}'
# Expect: {"error":"Unauthorized"} — longer response time = Supabase call happened
```

## What to Watch For
- Server log: compilation errors or `Cannot find module` = import failure
- 500 instead of 401 on no-auth request = handler crashed loading
- Turbopack slow-filesystem warning is cosmetic, not an error
- `GEMINI_API_KEY` must be set in `.env.local` for actual AI calls
