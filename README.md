# 🔧 Repair Shop Management System

Hệ thống quản lý tiệm sửa chữa thiết bị điện tử (điện thoại, laptop, PC...) với đầy đủ quy trình từ tiếp nhận đến bàn giao.

## 📋 Tính năng chính

- **3 vai trò**: CUSTOMER, STAFF (Technician), ADMIN
- **Quy trình**: Tiếp nhận → Chẩn đoán → Báo giá → Sửa chữa → Thanh toán → Bàn giao
- **Realtime**: WebSocket (STOMP) notifications
- **QR Code**: Tra cứu phiếu sửa chữa
- **PDF Export**: Xuất hóa đơn PDF
- **Dashboard Admin**: Thống kê doanh thu, phiếu, kho

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 17 + Spring Boot 3.2.x |
| ORM | Spring Data JPA (Hibernate) |
| Database | MySQL 8+ |
| Security | Spring Security + JWT |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Realtime | WebSocket (STOMP) |
| QR Code | ZXing (backend) |
| Frontend | ReactJS (Vite) |
| UI | Ant Design 5.x |
| State | React Context API |
| Charts | Recharts |

## 📁 Cấu trúc thư mục

```
ProjectManager/
├── repair-shop-backend/          # Spring Boot backend
│   ├── src/main/java/com/repairshop/
│   │   ├── config/               # SecurityConfig, SwaggerConfig, WebSocketConfig
│   │   ├── controller/           # AuthController, CustomerController, StaffController, AdminController
│   │   ├── dto/
│   │   │   ├── request/          # 20 request DTOs
│   │   │   └── response/         # 15 response DTOs + ApiResponse
│   │   ├── entity/               # 12 JPA entities
│   │   ├── enums/                # 11 enums
│   │   ├── exception/            # GlobalExceptionHandler + custom exceptions
│   │   ├── repository/           # 13 Spring Data JPA repositories
│   │   ├── security/             # JwtTokenProvider, JwtFilter, UserDetailsServiceImpl
│   │   ├── service/impl/         # 9 service implementations
│   │   └── util/                 # QrCodeUtil, TicketCodeGenerator, InvoiceCodeGenerator
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/
│           ├── V1__init_schema.sql    # Full schema (13 tables + indexes)
│           └── V2__seed_data.sql      # Dữ liệu mẫu
├── repair-shop-frontend/         # ReactJS frontend
│   └── src/
│       ├── api/                  # 7 API service files
│       ├── components/           # Shared components (StatusBadge, ...)
│       ├── context/              # AuthContext, NotificationContext
│       ├── layouts/              # CustomerLayout, StaffLayout, AdminLayout
│       ├── pages/
│       │   ├── customer/         # 6 customer pages
│       │   ├── staff/            # 7 staff pages
│       │   └── admin/            # 6 admin pages
│       ├── routes/               # ProtectedRoute
│       └── utils/                # constants, helpers
└── README.md
```

## 🚀 Hướng dẫn cài đặt & chạy

### Yêu cầu hệ thống
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm 9+
- MySQL 8+

---

### 1. Chuẩn bị Database

```bash
# Kết nối MySQL và tạo database
mysql -u root -p

# Trong MySQL shell:
CREATE DATABASE IF NOT EXISTS repair_shop_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

EXIT;
```

> **Lưu ý**: Flyway sẽ tự động chạy migration khi backend khởi động. **Không cần** import SQL thủ công.

---

### 2. Cấu hình Backend

Tạo file `.env` hoặc set environment variables (hoặc sửa `application.yml`):

```bash
# Sửa file application.yml nếu cần thay đổi cấu hình DB:
# src/main/resources/application.yml

# Hoặc set environment variables:
export DB_URL=jdbc:mysql://localhost:3306/repair_shop_management?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
export DB_USERNAME=root
export DB_PASSWORD=           # Để trống nếu không có password
export JWT_SECRET=MyVeryLongAndSecureSecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong
```

---

### 3. Chạy Backend

```bash
cd repair-shop-backend

# Build và chạy
mvn spring-boot:run

# Hoặc build JAR rồi chạy
mvn clean package -DskipTests
java -jar target/repair-shop-backend-1.0.0.jar
```

Backend sẽ khởi động tại **http://localhost:8080**

Flyway sẽ tự động:
1. Tạo các bảng từ `V1__init_schema.sql`
2. Import dữ liệu mẫu từ `V2__seed_data.sql`

---

### 4. Chạy Frontend

```bash
cd repair-shop-frontend

# Cài dependencies (lần đầu)
npm install

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại **http://localhost:5173**

---

### 5. Truy cập hệ thống

| URL | Mô tả |
|---|---|
| http://localhost:5173 | Frontend React app |
| http://localhost:8080/swagger-ui.html | Swagger UI - API documentation |
| http://localhost:8080/api-docs | OpenAPI JSON spec |

---

## 👤 Tài khoản mẫu

> **Mật khẩu chung: `Password123!`**

| Username | Role | Mô tả |
|---|---|---|
| `admin` | ADMIN | Quản trị viên |
| `tech_minh` | STAFF | Kỹ thuật viên |
| `recept_lan` | STAFF | Lễ tân |
| `customer_an` | CUSTOMER | Khách hàng 1 (có phiếu đã hoàn thành) |
| `customer_bich` | CUSTOMER | Khách hàng 2 (có phiếu COMPLETED chưa thanh toán) |
| `customer_cuong` | CUSTOMER | Khách hàng 3 (phiếu đang REPAIRING) |

---

## 📊 Demo Data (Dữ liệu mẫu)

Hệ thống có sẵn dữ liệu demo:
- **5 linh kiện** (màn hình iPhone, pin Samsung, bàn phím HP, IC sạc, camera OPPO)
- **3 thiết bị** (iPhone 13, HP EliteBook, Samsung A52)
- **5 phiếu** ở các trạng thái: DELIVERED, COMPLETED, REPAIRING, QUOTED, RECEIVED
- **Hóa đơn**: 1 đã thanh toán (TK-2024-001), 1 chưa thanh toán (TK-2024-002)

---

## 🔄 Luồng nghiệp vụ

```
Khách đăng ký/đăng nhập
    ↓
Staff tạo phiếu sửa chữa (sinh QR code)  [status: RECEIVED]
    ↓
Staff chẩn đoán                           [status: DIAGNOSING]
    ↓
Staff tạo báo giá → Thông báo cho khách   [status: QUOTED]
    ↓
Khách xem báo giá → Chấp nhận            [status: APPROVED]
    ↓
Staff xuất kho linh kiện                  [status: REPAIRING]
    ↓
Sửa xong → Thông báo cho khách           [status: COMPLETED]
    ↓
Tạo hóa đơn → Khách thanh toán (có thể nhiều lần)
    ↓
Bàn giao máy                             [status: DELIVERED]
```

---

## 📡 API Endpoints tổng quan

### Auth
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Làm mới token
- `GET /api/auth/me` - Thông tin user hiện tại

### Customer
- `GET /api/customer/tickets` - Danh sách phiếu
- `GET /api/customer/tickets/{id}/quote` - Xem báo giá
- `PUT /api/customer/quotes/{id}/accept` - Chấp nhận báo giá
- `GET /api/customer/devices` - Thiết bị của tôi

### Staff
- `POST /api/staff/tickets` - Tạo phiếu sửa chữa
- `PUT /api/staff/tickets/{id}/status` - Cập nhật trạng thái
- `POST /api/staff/tickets/{id}/quote` - Tạo báo giá
- `POST /api/staff/inventory/export` - Xuất kho linh kiện
- `POST /api/staff/invoices` - Tạo hóa đơn
- `POST /api/staff/payments` - Ghi nhận thanh toán

### Admin
- `GET /api/admin/dashboard/summary` - Thống kê tổng hợp
- `GET /api/admin/dashboard/revenue` - Doanh thu theo thời gian
- `GET /api/admin/staff` - Quản lý nhân viên
- `GET /api/admin/tickets` - Tất cả phiếu

> 📖 Xem đầy đủ tại Swagger UI: http://localhost:8080/swagger-ui.html

---

## 🔒 Bảo mật

- **JWT Access Token**: Hết hạn sau 30 phút
- **JWT Refresh Token**: Hết hạn sau 7 ngày
- **BCrypt**: Hash mật khẩu với strength 10
- **@PreAuthorize**: Phân quyền từng endpoint theo role
- **CORS**: Chỉ cho phép từ http://localhost:5173

---

## 🧪 Unit Tests

```bash
cd repair-shop-backend
mvn test
```

Tests cover:
- `AuthServiceImplTest` - Đăng ký, đăng nhập
- `TicketServiceImplTest` - Tạo phiếu, cập nhật trạng thái
- `QuoteServiceImplTest` - Tạo báo giá, accept/reject
- `InvoicePaymentServiceImplTest` - Tạo hóa đơn, thanh toán

---

## 🌐 WebSocket Notifications

Backend tự động gửi notification khi:
- Phiếu được tạo → `TICKET_CREATED` → Customer
- Staff tạo báo giá → `QUOTE_AVAILABLE` → Customer  
- Customer accept báo giá → `QUOTE_CONFIRMED` → Staff + Admin
- Customer reject báo giá → `QUOTE_REJECTED` → Staff + Admin
- Phiếu hoàn thành → `TICKET_COMPLETED` → Customer

Frontend subscribe tới `/queue/notifications/{userId}` qua STOMP/SockJS.

---

## ⚠️ Lưu ý Production

- Thay đổi `JWT_SECRET` bằng giá trị ngẫu nhiên 256+ bit
- Cấu hình HTTPS
- Thay `ddl-auto: validate` (đã set sẵn, an toàn cho production)
- Giới hạn CORS origins thực tế
- Sử dụng connection pool phù hợp (HikariCP đã cấu hình)
- Blacklist refresh token nên dùng Redis thay in-memory Set trong production
# equipment-repair
