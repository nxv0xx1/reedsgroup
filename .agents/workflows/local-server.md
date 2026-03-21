---
description: How to start and troubleshoot the local development server for the Reeds Group website
---

# Local Dev Server Workflow

## ⚠️ MANDATORY PRE-FLIGHT CHECK — DO THIS EVERY TIME

**Before starting ANY new server — even if you think none are running — you MUST first check for existing servers:**

// turbo
```bash
netstat -ano | findstr "LISTENING" | findstr /R "5500 8080 3000 8000"
```

- **If output is empty**: Safe to proceed — start a new server.
- **If output shows PIDs**: A server is already running. **Do NOT start another one.** Either reuse the existing server, or kill it first with `taskkill /PID <pid> /F` before starting a new one.
- **If multiple PIDs are on the same port**: You have a conflict. Kill ALL of them, verify the port is clear, then start fresh.

This check prevents the most common issue: duplicate server processes stacking on the same port, which causes `ERR_EMPTY_RESPONSE` errors in the browser.

---

## Starting the Server

```bash
python -m http.server 5500 --bind 0.0.0.0
```

Run this from the project root: `c:\Users\chida\Documents\reedsgroup`

The site will be available at: **http://localhost:5500/**

---

## Troubleshooting: `ERR_EMPTY_RESPONSE` or Server Not Responding

### Root Cause
Multiple server processes can stack up on the same port (e.g. two Python servers both listening on port 5500). When this happens, the port gets confused and returns empty responses. This typically occurs when:
- A previous server wasn't properly terminated before starting a new one
- The browser subagent or other tools start additional servers
- A `Ctrl+C` didn't fully kill the process

### Diagnostic Steps

// turbo
1. **Check for existing listeners on common ports:**
   ```bash
   netstat -ano | findstr "LISTENING" | findstr /R "5500 8080 3000 8000"
   ```

2. **Look for duplicate PIDs on the same port.** If you see two or more PIDs listening on the same port number, that's the problem.

3. **Kill ALL conflicting processes:**
   ```bash
   taskkill /PID <pid1> /F
   taskkill /PID <pid2> /F
   ```
   (Replace `<pid1>`, `<pid2>` with the actual PIDs from step 1)

// turbo
4. **Verify ports are clear** (should return empty):
   ```bash
   netstat -ano | findstr "LISTENING" | findstr /R "5500 8080"
   ```

5. **Start a single clean server:**
   ```bash
   python -m http.server 5500 --bind 0.0.0.0
   ```

// turbo
6. **Verify it works:**
   ```bash
   python -c "import urllib.request; r = urllib.request.urlopen('http://localhost:5500/index.html'); print('Status:', r.status, '| Size:', len(r.read()), 'bytes')"
   ```

### Prevention Checklist
- **Always check for existing servers BEFORE starting a new one** (step 1)
- **Always terminate old servers** before starting replacements
- **Use a single consistent port** (5500) to avoid confusion
- **Don't use `npx` for servers** on this system — PowerShell script execution is disabled. Use Python's built-in `http.server` instead
- **After file changes**, the Python server auto-serves the new files (no restart needed)

### Important Notes
- `npx` commands fail on this system due to PowerShell execution policy restrictions
- Python's `http.server` is the reliable fallback
- The `--bind 0.0.0.0` flag ensures the server binds to all interfaces
