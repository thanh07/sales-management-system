#!/bin/bash
# ==============================================================================
# SCRIPT TỰ ĐỘNG TRIỂN KHAI ỨNG DỤNG BÁN HÀNG LÊN VPS UBUNTU / DEBIAN
# IP VPS: 221.121.2.34
# ==============================================================================

set -e

echo "🚀 [1/6] Cập nhật hệ thống & cài đặt môi trường Node.js 20 LTS..."
apt-get update -y
apt-get install -y curl git nginx build-essential

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js Version: $(node -v)"
echo "✅ NPM Version: $(npm -v)"

echo "🚀 [2/6] Cài đặt PM2 (Process Manager tự khởi động cùng VPS)..."
npm install -g pm2

echo "🚀 [3/6] Cài đặt Dependencies & Build ứng dụng..."
npm install
npm --prefix apps/api run build
npm --prefix apps/web run build

echo "🚀 [4/6] Khởi chạy ứng dụng Backend & Frontend với PM2..."
pm2 delete sales-api 2>/dev/null || true
pm2 delete sales-web 2>/dev/null || true

pm2 start "npm run dev:api" --name "sales-api"
pm2 start "npm --prefix apps/web run dev -- --port 3000 --host" --name "sales-web"
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

echo "🚀 [5/6] Cấu hình Reverse Proxy Nginx cho IP 221.121.2.34..."
cat << 'EOF' > /etc/nginx/sites-available/sales-app
server {
    listen 80;
    server_name 221.121.2.34 _;

    client_max_body_size 50M;

    # Frontend Web Client
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Server
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/sales-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "=============================================================================="
echo "🎉 CHÚC MỪNG! ỨNG DỤNG BÁN HÀNG ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG LÊN VPS!"
echo "👉 Địa chỉ truy cập Web: http://221.121.2.34"
echo "👉 API Backend Endpoint: http://221.121.2.34/api/v1"
echo "=============================================================================="
