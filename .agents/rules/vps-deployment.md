# VPS Deployment Guidelines & Process Cleanup Rule

1. **Mandatory Process Cleanup**:
   Every VPS deployment or update task MUST execute `pm2 delete all` before building and launching services.

2. **No Duplicate PM2 Instances**:
   Never execute `pm2 start` repeatedly without checking or cleaning existing instances.

3. **Production Server Entrypoint**:
   API backend MUST be launched from compiled JavaScript: `apps/api/dist/server.js` (not `ts-node-dev`) to ensure production performance and clean body parser limits (`50MB`).
