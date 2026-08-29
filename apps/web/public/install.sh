#!/bin/bash
set -e

echo "=============================================================================="
echo "🚀 ĐANG TỰ ĐỘNG TRIỂN KHAI ỨNG DỤNG BÁN HÀNG LÊN VPS UBUNTU..."
echo "=============================================================================="

# 1. Update system & Install Node.js 20, Nginx, git, curl, tar
echo "📦 [1/6] Cài đặt môi trường hệ thống (Node.js 20 LTS, Nginx, PM2)..."
apt-get update -y > /dev/null 2>&1 || true
apt-get install -y curl git nginx build-essential tar > /dev/null 2>&1

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
fi

npm install -g pm2 > /dev/null 2>&1 || true

echo "✅ Node.js: $(node -v) | NPM: $(npm -v)"

# 2. Prepare app directory
echo "📁 [2/6] Giải nén bộ mã nguồn ứng dụng vào /var/www/sales-management-system..."
mkdir -p /var/www/sales-management-system
cd /var/www/sales-management-system

# Download source code tarball
curl -sSL https://further-chargers-shaw-latter.trycloudflare.com/sales-app.tar.gz -o sales-app.tar.gz
tar -xf sales-app.tar.gz || tar -xzf sales-app.tar.gz
rm -f sales-app.tar.gz

# 3. Install NPM Packages & Build
echo "🔨 [3/6] Cài đặt thư viện dependencies & Build hệ thống..."
npm install
npm --prefix apps/api run build
npm --prefix apps/web run build

# 4. Start PM2 Daemons
echo "⚡ [4/6] Khởi chạy Backend API & Frontend Web bằng PM2..."
pm2 delete sales-api 2>/dev/null || true
pm2 delete sales-web 2>/dev/null || true

pm2 start "npm run dev:api" --name "sales-api"
pm2 start "npm --prefix apps/web run dev -- --port 3000 --host" --name "sales-web"
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

# 5. Configure Nginx
echo "🌐 [5/6] Cấu hình Web Server Nginx cho IP 221.121.2.34 (Port 80)..."
cat << 'EOF' > /etc/nginx/sites-available/sales-app
server {
    listen 80;
    server_name 221.121.2.34 _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

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
echo "🎉 CHÚC MỪNG! ỨNG DỤNG BÁN HÀNG ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG!"
echo "👉 Truy cập Web Admin & POS ngay tại: http://221.121.2.34"
echo "👉 Endpoint API Backend: http://221.121.2.34/api/v1"
echo "=============================================================================="
