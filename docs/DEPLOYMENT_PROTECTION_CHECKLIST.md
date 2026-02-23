# Deployment & Protection Checklist

Use this to confirm all protections are in place when you deploy (including with `--local-build`).

---

## What the deploy script does (both full and local-build)

| Step | Full deploy | Local-build |
|------|-------------|-------------|
| **Unlock before upload** | ✅ Yes | ✅ Yes |
| **Upload source** (rsync) | ✅ Yes | ✅ Yes |
| **Build** | On server (or OOM) | On your Mac |
| **Upload standalone** | N/A | ✅ Yes (rsync `.next/standalone`) |
| **Start PM2** (standalone server) | ✅ Yes | ✅ Yes |
| **Re-lock critical files** | ✅ Yes | ✅ Yes |

**Re-locked files** (malware cannot overwrite): `package.json`, `ecosystem.config.json`, `next.config.js`, `next.config.ts`, `.env`, `.env.production`.

**Unlock before upload** ensures rsync can overwrite those files on the server; they are locked again at the end of every deploy.

---

## Server-side protections (you must ensure these)

| Protection | What it does | How to confirm |
|------------|--------------|----------------|
| **detect-miners.sh** | Kills miner processes (xmrig, pulseadio, etc.); removes miner files in project and `~/.pulseadio` | Deployed with app. Run: `ssh fs 'cd ~/fengshui-layout && bash detect-miners.sh'` |
| **Cron (detect-miners)** | Runs detect-miners every 5 min so miners are killed/removed automatically | `ssh fs 'crontab -l'` — should see `detect-miners` or similar |
| **File locking (chattr +i)** | Done by deploy script after every deploy | After deploy, `ssh fs 'lsattr ~/fengshui-layout/package.json'` — should show `i` |
| **fail2ban** (if installed) | Blocks IPs after failed SSH | Optional; not part of this repo |

---

## What is NOT in place (optional / manual)

1. **Request blocking at runtime**  
   The app runs with Next.js **standalone** server (`.next/standalone/server.js`), not the custom root `server.js`. The custom server blocks URLs like `/xmrig`, `/phpMyAdmin`, etc. With standalone, that HTTP-level blocking is not active. Your app is still protected by firewall and detect-miners. To get similar blocking, you could add Next.js middleware that returns 403 for those paths.

2. **Cron for detect-miners**  
   The script does not add cron for you. To run detect-miners every 5 minutes:
   ```bash
   ssh fs '(crontab -l 2>/dev/null | grep -v detect-miners; echo "*/5 * * * * cd /home/ec2-user/fengshui-layout && bash detect-miners.sh") | crontab -'
   ```

3. **Crontab review**  
   Periodically check for bad cron entries:  
   `ssh fs 'crontab -l'` and `ssh fs 'ls /etc/cron.d'`.

4. **Home-dir malware**  
   detect-miners.sh now removes `~/.pulseadio` and `pulseadio` from the project. If you ever see other suspicious dirs in `~` (e.g. `.foo` that runs on login), remove them and check `crontab -l` and `~/.bashrc`.

---

## Quick verification after deploy

```bash
# 1. App is up
ssh fs 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000'
# Expect 200

# 2. Protected files are locked
ssh fs 'lsattr /home/ec2-user/fengshui-layout/package.json'
# Expect: ----i---------e----- package.json

# 3. detect-miners is present and recent
ssh fs 'ls -la /home/ec2-user/fengshui-layout/detect-miners.sh'

# 4. (Optional) Run miner check once
ssh fs 'cd ~/fengshui-layout && bash detect-miners.sh'
```

---

## Summary

- **Deploy (full or local-build):** Unlock → upload → build (or upload standalone) → start PM2 → re-lock. Protections applied every time.
- **detect-miners.sh:** Deployed with app; add cron so it runs every 5 min.
- **Runtime request blocking:** Not in standalone; add middleware if you want it.
