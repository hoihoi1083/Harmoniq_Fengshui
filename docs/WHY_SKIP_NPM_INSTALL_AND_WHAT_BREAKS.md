# Why We Skip npm install on the Server (and What Breaks)

## Why "Skipping npm install (AWS blocks it)"?

Your EC2 instance has **outbound HTTP/HTTPS blocked by AWS** (since the Dec 2025 malware incident). See **OUTBOUND_BLOCK_INVESTIGATION.md**.

- **npm install** talks to **registry.npmjs.org** over **HTTPS (port 443)**.
- So on that server, `npm install` **fails or times out**.
- **complete-deployment.sh** therefore **skips** `npm install` and reuses the **existing** `node_modules` on the server so the rest of the deploy (e.g. build) can at least run with what’s already there.

So: we skip it **because** AWS blocks outbound; the script is written to assume that and avoid a guaranteed failure.

---

## What doesn’t work when npm install is skipped?

1. **New dependencies in `package.json`**  
   Anything you added **after** the last time someone ran `npm install` on the server (or after the block was applied) **is not** in the server’s `node_modules`.  
   - **Build:** `npm run build` can fail with **"Cannot find module 'X'"** or similar.  
   - **Runtime:** If the build somehow passed (e.g. old code path), any request that hits code using the new package will throw at runtime.

2. **Version bumps**  
   If you upgraded a dependency (e.g. `next`, `react`, a Radix package) only in your local `package.json` and lockfile, the server still has the old version. You can get **version mismatches**, type errors at build, or runtime bugs.

3. **No way to “sync” server to your current app**  
   Until outbound is unblocked (or you use another way to get dependencies onto the server), the server **cannot** install the same set of packages as your Mac.

So: **any new function that depends on a new or updated dependency can “not work”** on the server for this reason.

---

## How to see what’s missing on the server

**On your Mac (project root):**

```bash
# List dependency names from package.json
node -e "console.log(Object.keys(require('./package.json').dependencies).join('\n'))"
```

**On the server:**

```bash
ssh fs 'cd ~/fengshui-layout && ls node_modules' | wc -l
```

Compare with how many packages you expect. You can also diff:

```bash
# Local
node -e "console.log(Object.keys(require('./package.json').dependencies).sort().join('\n'))" > /tmp/local-deps.txt

# Server (run from project dir)
ssh fs 'cd ~/fengshui-layout && node -e "console.log(Object.keys(require(\"./package.json\").dependencies).sort().join(\"\n\"))"' > /tmp/server-deps.txt

# Compare
diff /tmp/local-deps.txt /tmp/server-deps.txt
```

If the server never ran `npm install` with your current `package.json`, **every** dependency might be “missing” or at a different version; the diff helps only if the server had some past install.

---

## What to do

1. **When AWS unblocks outbound**  
   Re-run deploy; if the script is updated to **try** `npm install` first and only skip on failure, it will start installing again and new dependencies will work.

2. **Before unblock: new dependencies**  
   - Avoid adding new dependencies if the server can’t run `npm install`.  
   - Or: build on your Mac (or another machine with network) and rsync **`.next`** (and if needed `node_modules`) to the server — different from the current “build on server” flow.

3. **“Function not working”**  
   If a feature uses a package that’s not on the server (or an older version), that function will fail until the server has the right dependencies (unblock + npm install, or rsync of node_modules + .next).

---

## Summary

| Question | Answer |
|----------|--------|
| Why skip npm install? | AWS blocks outbound HTTPS; npm registry is unreachable from the server. |
| What breaks? | New or updated dependencies; any code that relies on them. |
| Why is my new function not working? | Likely it depends on a package that’s not (or not the right version) in server’s node_modules. |
| How to fix? | Get outbound unblocked and run npm install on server, or build locally and deploy the built output. |
