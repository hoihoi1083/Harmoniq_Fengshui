# Deployment Summary & Server Readiness

This document summarizes **how you deploy** (from the repo’s deployment docs and scripts) and **how to check the server** before deploying.

---

## 1. How You Deploy (from the codebase)

You have **two main flows** in the repo:

### A. PM2 + rsync (documented in DEPLOYMENT_GUIDE, DEPLOYMENT_CHECKLIST, DEPLOYMENT_SUMMARY)

- **Scripts:** `complete-deployment.sh` (fast) or `secure-deployment.sh` (clean + scan + deploy).
- **Target:** SSH alias **`fs`** → host **54.205.0.111**, user **ec2-user**.
- **Path on server:** `/home/ec2-user/fengshui-layout` (same as `~/fengshui-layout` for ec2-user).

**Steps (what the scripts do):**

1. **Local:** Check SSH to `fs`, then **rsync** source to server (excludes `node_modules`, `.next`, `.git`, logs, local `.env`).
2. **Server:**
   - Unlock protected files (`chattr -i` on package.json, ecosystem.config.json, next.config, .env).
   - Stop PM2: `pm2 stop all`.
   - **complete-deployment.sh:** Skips `npm install` (AWS outbound block), runs `npm run build`, copies `public` and `.next/static` into `.next/standalone/`, copies `.env.production` into standalone, then `pm2 start ecosystem.config.json`.
   - **secure-deployment.sh:** Backs up logs/.env/ecosystem.config.json, rsync, restores backups, then `rm -rf node_modules .next`, `npm install --production`, `npm run build`, copy assets, then `pm2 start ecosystem.config.json`.
   - Re-lock files (`chattr +i`).

**Config files:**

- **PM2:** `ecosystem.config.json` (in repo; script path in config is `/home/ec2-user/fengshui-layout/server.js` — ensure standalone build puts `server.js` where PM2 expects, or adjust config to use `.next/standalone/server.js` and correct `cwd`).
- **Env:** `.env` or `.env.production` must exist **on the server** (not committed; see `env-template-aws.env`).

**Docs to read:** `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_SUMMARY.md`, `QUICK_REFERENCE.md`.

### B. GitHub Actions + Docker (alternative)

- **Workflow:** `.github/workflows/deploy-ecs.yml` on push to **test-deploy**.
- **Target:** EC2 via secrets `EC2_IP`, `EC2_USERNAME`, `FENGSHUI_PEM`.
- **Path on server in workflow:** `/home/workspace/FengShuiLayout` (different from PM2 path).
- **Steps:** SSH → `git pull` → stop/rm existing container → `docker build -t fengshui-web-docker .` → `docker run -d -p 3000:3000 fengshui-web-docker`.

The **server readiness script** in this repo is written for the **PM2 + rsync** flow (path `/home/ec2-user/fengshui-layout`). If you use only the Docker workflow, the script’s path and checks (PM2, Node, etc.) won’t match; you’d need a separate check for Docker and `/home/workspace/FengShuiLayout`.

---

## 2. What the Server Must Have (for PM2 deploy)

| Requirement | Purpose |
|-------------|--------|
| **Node.js 18+** | Next.js build and runtime |
| **npm** | `npm run build` (and `npm install` if using secure-deployment.sh) |
| **PM2** | Process manager for `server.js` / standalone |
| **Enough disk** | ≥ 2GB free (recommend 5GB+) for node_modules + .next |
| **Directory** | `/home/ec2-user/fengshui-layout` exists and writable by ec2-user |
| **Port 3000** | Free (or occupied only by current app; deploy stops PM2 then restarts) |
| **.env or .env.production** | On server; see `env-template-aws.env` for variables |

**SSH (from your machine):**

- Alias **`fs`** in `~/.ssh/config`: HostName 54.205.0.111, User ec2-user, IdentityFile ~/.ssh/fengshui.pem (or equivalent).

**Note (ecosystem.config.json):**  
`DEPLOYMENT_GUIDE.md` mentions `ecosystem.config.js`; the repo and scripts use **`ecosystem.config.json`**. The guide’s example uses `script: ".next/standalone/server.js"` and `cwd: "/home/ec2-user/fengshui-layout"`. Your current `ecosystem.config.json` uses `script: "/home/ec2-user/fengshui-layout/server.js"`. Ensure the path matches where `server.js` actually is after build (standalone puts it in `.next/standalone/server.js`).

---

## 3. How to Check If the Server Is Ready

Use the script **`scripts/aws-server-readiness-check.sh`**. It checks: disk, Node, PM2, deploy directory, port 3000, env files, and npm.

**Run from your machine (no copy to server):**

```bash
cd /Users/michaelng/Desktop/HarmoniqFengShui/FengShuiLayout
ssh fs 'bash -s' < scripts/aws-server-readiness-check.sh
```

**Or copy to server and run there:**

```bash
scp scripts/aws-server-readiness-check.sh fs:~/
ssh fs 'chmod +x aws-server-readiness-check.sh && ./aws-server-readiness-check.sh'
```

Fix any **FAIL** before deploying; **WARN** are optional but recommended.

---

## 4. Bug in complete-deployment.sh (lines 156–159)

In `complete-deployment.sh`, inside the SSH heredoc, there is a broken block:

- Around lines 156–159 you have an “In# Restore backup if build failed” comment and an `if [ -d ".next.backup" ]; then ... exit 1; fi` that runs **before** any build. That block would restore a backup and then **exit 1** every time (deployment always fails at that point).
- The intended logic is: **if** `npm run build` fails, **then** restore `.next.backup` and exit 1. So the “restore backup and exit” block should run only in the **failure branch** of the build step (e.g. after `npm run build` and a check like `[ ! -d ".next/standalone" ]`).

Recommended fix: remove or move that orphaned block so it runs only when the build fails (after `npm run build` and the standalone check). Until fixed, **complete-deployment.sh** may exit early and never reach the build step.

---

## 5. Quick Commands

```bash
# Check server readiness
ssh fs 'bash -s' < scripts/aws-server-readiness-check.sh

# Deploy (normal)
./complete-deployment.sh

# Deploy (clean + scan + deploy)
./secure-deployment.sh

# After deploy: status and logs
ssh fs "pm2 status"
ssh fs "pm2 logs --lines 50"
```

---

## 6. Doc References

- **DEPLOYMENT_GUIDE.md** – Full PM2 + rsync process, ecosystem config, troubleshooting.
- **DEPLOYMENT_CHECKLIST.md** – Secure deployment steps and verification.
- **DEPLOYMENT_SUMMARY.md** – Summary and quick reference.
- **QUICK_REFERENCE.md** – Short deploy and health commands.
- **env-template-aws.env** – Required environment variables for production.
