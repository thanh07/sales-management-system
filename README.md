# 🛒 Sales Manager Pro - Systems Documentation & API Manual

Hệ thống **Quản lý Bán hàng & Điểm Bán Quầy (POS/ERP/CRM)** dành cho Doanh nghiệp vừa và nhỏ (SMB).

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS (Dark Mode + Glassmorphism), Zustand State Management, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.io, JWT Authentication + RBAC Permissions, Helmet, CORS.
- **Database**: PostgreSQL / Supabase Compatible.

---

## 🔐 Credentials Thử nghiệm (Demo Accounts)

| Vai trò (Role) | Username | Password | Phân quyền (Permissions) |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Quản trị)** | `admin` | `admin123` | Full Control (*), Xem tất cả báo cáo & Quản lý nhân viên |
| **🛒 Thu Ngân (Cashier)** | `cashier` | `cashier123` | Bán hàng POS, Tạo hóa đơn, Xem danh mục sản phẩm |
| **📦 Thủ Kho (Warehouse)** | `warehouse` | `warehouse123` | Quản lý kho, Nhập/Xuất kho, Kiểm kê tồn kho |

---

## ⌨️ Bộ Phím Tắt Bán Quầy POS (POS Keyboard Shortcuts)

- `F1`: Tìm kiếm nhanh sản phẩm / Focus ô tìm kiếm
- `F8`: Tạm giữ đơn hàng (Parked Order)
- `F9`: Thanh toán hóa đơn tức thì & Trừ kho
- `F10`: Làm sạch / Hủy giỏ hàng
- `F12`: Xem & In hóa đơn nhiệt tiêu chuẩn K80 / A5

---

## 📡 API Endpoints Manual

### 1. Authentication & Users
- `POST /api/v1/auth/login`: Đăng nhập hệ thống, nhận Access Token & Refresh Token.
- `GET /api/v1/auth/me`: Lấy thông tin tài khoản đang đăng nhập + Danh sách phân quyền.
- `GET /api/v1/auth/users`: Lấy danh sách nhân viên cửa hàng.

### 2. Products & Catalog
- `GET /api/v1/products`: Danh sách sản phẩm (Filter theo từ khóa, Barcode, Danh mục).
- `GET /api/v1/products/barcode/:code`: Tìm nhanh sản phẩm qua máy quét Barcode.
- `POST /api/v1/products`: Thêm sản phẩm & biến thể mới.

### 3. POS & Order Checkout
- `POST /api/v1/pos/checkout`: Thanh toán hóa đơn (Tự động trừ kho, tính tiền thừa, cập nhật tích điểm).
- `POST /api/v1/pos/parked-orders`: Tạm lưu giỏ hàng quầy.
- `GET /api/v1/pos/parked-orders`: Danh sách giỏ hàng đang tạm giữ.

### 4. CRM & Customers
- `GET /api/v1/customers`: Danh sách khách hàng (Lọc theo nhóm, SĐT).
- `POST /api/v1/customers`: Thêm mới khách hàng.
- `GET /api/v1/customers/abc-analysis`: Thống kê phân loại khách hàng Pareto ABC (80/20).

### 5. Reports & Analytics
- `GET /api/v1/reports/summary`: Thống kê tổng quan doanh thu, lợi nhuận, số đơn hôm nay.
- `GET /api/v1/reports/revenue-chart`: Dữ liệu biểu đồ doanh thu & lợi nhuận tuần này.
- `GET /api/v1/reports/top-selling`: Top 5 sản phẩm bán chạy nhất.
- `GET /api/v1/reports/low-stock`: Danh sách cảnh báo sản phẩm sắp hết hàng (Tồn kho <= minStock).

---

## 🛠️ Hướng dẫn Khởi chạy Địa phương (Local Setup)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy Backend API Server (Port 5000)
npm run dev:api

# 3. Khởi chạy Frontend Web POS App (Port 3000)
npm run dev:web
```
