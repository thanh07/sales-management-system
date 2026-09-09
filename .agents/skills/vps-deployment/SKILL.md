---
name: vps-deployment
description: >-
  Standard Operating Procedure for deploying Sales Management System to VPS server (221.121.2.34).
  MANDATORY RULE: Always clean up all stale background PM2 processes (`pm2 delete all`) before rebuilding and starting production services to prevent port collisions (EADDRINUSE) or obsolete cached body-parser limits (PayloadTooLargeError).
---

# VPS Deployment Skill & Protocol

Whenever deploying or updating the application on the production VPS (`221.121.2.34`), ALWAYS follow this mandatory procedure to guarantee clean process execution, no port conflicts (`5000`), and zero stale PM2 background tasks.

---

## 1. Core Rule: Process Cleanup First
- **Command**: `pm2 delete all`
- **Rationale**: Prevents PM2 from spawning multiple duplicate instances of `sales-api` or `sales-web`. Ensures old Node processes holding port `5000` are completely terminated so new compiled code and updated body-parser limits (`50MB`) take effect immediately.

---

## 2. Mandatory Deployment Sequence

```bash
# 1. Pull latest code from GitHub
cd /var/www/sales-management-system && git pull origin main

# 2. Build production artifacts
npm --prefix apps/api run build
npm --prefix apps/web run build

# 3. Clean up ALL old/stale PM2 processes
pm2 delete all 2>/dev/null || true

# 4. Launch clean single instances of API and Web
pm2 start apps/api/dist/server.js --name sales-api
pm2 start "npm --prefix apps/web run dev -- --port 3000 --host" --name sales-web

# 5. Save PM2 list & reload Nginx
pm2 save
systemctl reload nginx

# 6. Verify health
curl -s http://localhost/api/v1/health
```

---

## 3. Automation Scripts
The codebase maintains scratch deployment scripts adhering to this skill:
- [deploy_vps_git.py](file:///home/duy/.gemini/antigravity/brain/49a7e058-7971-4163-b87d-fd244c7be342/scratch/deploy_vps_git.py)
- [deploy_to_vps_full.py](file:///home/duy/.gemini/antigravity/brain/49a7e058-7971-4163-b87d-fd244c7be342/scratch/deploy_to_vps_full.py)
