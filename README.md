# MayHem - Nền Tảng Quản Trị & Đối Chiếu Báo Cáo Tài Chính 29 Ngân Hàng Việt Nam

Hệ thống chuyên sâu phục vụ phân tích, đối chiếu định lượng và quản trị dữ liệu báo cáo tài chính của 29 Ngân hàng thương mại tại Việt Nam, đồng thời hỗ trợ mở rộng linh hoạt cho đa ngành (Bất động sản, Thép, Bán lẻ, Chứng khoán,...).

---

## 📌 MỤC LỤC
1. [Tổng Quan Hệ Thống](#-tổng-quan-hệ-thống)
2. [Kiến Trúc Công Nghệ](#-kiến-trúc-công-nghệ)
3. [Yêu Cầu Tài Nguyên & Môi Trường](#-yêu-cầu-tài-nguyên--môi-trường)
4. [Hướng Dẫn Cài Đặt & Cấu Hình Từng Bước](#-hướng-dẫn-cài-đặt--cấu-hình-từng-bước)
5. [Tài Khoản Đăng Nhập & Phân Quyền (RBAC)](#-tài-khoản-đăng-nhập--phân-quyền-rbac)
6. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
7. [Các Tính Năng Nổi Bật](#-các-tính-năng-nổi-bật)
8. [Tài Liệu API Endpoints (V1)](#-tài-liệu-api-endpoints-v1)
9. [Chính Sách Git & Bảo Mật](#-chính-sách-git--bảo-mật)

---

## 🌟 TỔNG QUAN HỆ THỐNG

MayHem giải quyết bài toán chuẩn hóa, đối soát và lọc dữ liệu tài chính phức tạp:
- **Ma trận đối chiếu tài chính**: Tổng hợp hơn 30 chỉ tiêu tài chính cốt lõi xuyên suốt nhiều niên độ (2020 – 2024+) cho 29 ngân hàng thương mại Việt Nam (VCB, TCB, MBB, ACB, CTG, BID, VPB,...).
- **Bộ lọc tiêu chí thông minh (Smart Screener)**: Cho phép chuyên viên lọc theo 15 chỉ tiêu cốt lõi (NIM, CIR, ROE, ROA, NPL, CASA, LDR,...) hoặc toàn bộ danh mục tài chính chi tiết với các phép so sánh `>`, `<`, `=`.
- **Quản trị đa ngành linh hoạt (Industry Management)**: Cho phép Super Admin thêm mới các phân ngành kinh tế khác, cấu hình danh sách trường tài chính đặc thù của từng ngành.
- **Audit Trail & Rollback**: Lưu vết lịch sử thay đổi số liệu từng ô dữ liệu với khả năng hoàn tác (Rollback) tức thì.
- **Xuất báo cáo & Sao lưu**: Hỗ trợ xuất dữ liệu ra Excel định dạng chuẩn và Backup/Restore snapshot hệ thống.

---

## 🛠️ KIẾN TRÚC CÔNG NGHỆ

- **Backend**: [Laravel 12.x](https://laravel.com/) (PHP 8.2+)
  - Kiến trúc RESTful API V1
  - Xác thực phiên làm việc (Session/Cookie Token) với Middleware phân quyền đa cấp (`mayhem.auth`, `mayhem.role`)
  - Cơ sở dữ liệu: Hỗ trợ linh hoạt **SQLite** (chạy ngay) hoặc **MySQL / MariaDB** (MAMP, XAMPP, Docker)
- **Frontend**: Single Page Application (SPA)
  - Kiến trúc Modern Vanilla JS (Module hóa linh hoạt: `components/`, `core/`, `calculations/`)
  - Giao diện thiết kế bằng [Tailwind CSS](https://tailwindcss.com/) & FontAwesome Icons
  - Đồ họa trực quan: Canvas Charts, Radar Chart so sánh ngân hàng, Heatmap đối chiếu chỉ tiêu
  - Client-side Caching: IndexedDB & In-memory cache tối ưu tốc độ phản hồi

---

## 💻 YÊU CẦU TÀI NGUYÊN & MÔI TRƯỜNG

Trước khi cài đặt, đảm bảo máy tính đã cài đặt các công cụ sau:

1. **PHP**: Phiên bản `>= 8.2`
   - Bật các extension PHP bắt buộc trong file `php.ini`:
     - `pdo`, `pdo_sqlite` (nếu dùng SQLite) hoặc `pdo_mysql` (nếu dùng MySQL)
     - `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`, `fileinfo`
2. **Composer**: Phiên bản `>= 2.x` (Quản lý thư viện PHP)
3. **Cơ sở dữ liệu**:
   - *Tùy chọn A (Khuyên dùng khi dev)*: **SQLite** (tích hợp sẵn trong PHP, không cần cài đặt thêm server DB).
   - *Tùy chọn B*: **MySQL >= 8.0** hoặc **MariaDB** (thông qua MAMP, XAMPP, Laragon hoặc Docker).
4. **Node.js & npm** *(Tùy chọn)*: Node.js `>= 18.x` (chỉ cần khi muốn build lại Vite assets).

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CẤU HÌNH TỪNG BƯỚC

### Bước 1: Tải mã nguồn về máy
```bash
git clone https://github.com/LesiAimAgency/MayHem.git
cd MayHem/backend
```

### Bước 2: Cài đặt các gói phụ thuộc PHP (Composer)
```bash
composer install
```

### Bước 3: Thiết lập file môi trường (.env)
Tạo file `.env` từ file mẫu `.env.example`:
```bash
# Trên Windows PowerShell:
Copy-Item .env.example .env

# Trên Linux/macOS hoặc Git Bash:
cp .env.example .env
```

Tạo khóa ứng dụng (Application Key):
```bash
php artisan key:generate
```

---

### Bước 4: Cấu hình Cơ sở dữ liệu

Bạn có thể lựa chọn 1 trong 2 hình thức CSDL dưới đây:

#### Cách 1: Sử dụng SQLite (Đơn giản nhất, khuyến nghị cho chạy thử)
Mở file `.env` và kiểm tra cấu hình kết nối:
```ini
DB_CONNECTION=sqlite
```
*(Nếu chưa có file `database/database.sqlite`, lệnh migrate ở Bước 5 sẽ tự động hỏi và tạo giúp bạn).*

#### Cách 2: Sử dụng MySQL (Qua MAMP, XAMPP, Laragon)
1. Mở bảng điều khiển MAMP/XAMPP và khởi động dịch vụ **MySQL**.
2. Tạo một database mới tên là `mayhem` (qua phpMyAdmin hoặc MySQL CLI):
   ```sql
   CREATE DATABASE mayhem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Cập nhật thông số kết nối trong file `.env`:
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306         # Nếu dùng MAMP mặc định thường là 8889, XAMPP là 3306
   DB_DATABASE=mayhem
   DB_USERNAME=root
   DB_PASSWORD=root     # MAMP mặc định là 'root', XAMPP mặc định để trống ''
   ```

---

### Bước 5: Chạy Migration & Nạp dữ liệu mẫu ban đầu (Database Seeder)
Lệnh này sẽ tự động khởi tạo các bảng và nạp toàn bộ dữ liệu mẫu (Tài khoản người dùng, 29 ngân hàng, bộ chỉ tiêu cốt lõi, danh mục ngành):
```bash
php artisan migrate:fresh --seed
```

> [!NOTE]
> Các Seeder được nạp bao gồm:
> - `UserSeeder`: Tạo 3 tài khoản mẫu ứng với 3 cấp phân quyền.
> - `FinancialDatasetSeeder`: Nạp danh sách 29 ngân hàng và dữ liệu tài chính 2020 - 2024.
> - `FilterIndustryConfigSeeder`: Cấu hình danh mục ngành (Ngân hàng, Bất động sản, Thép,...).
> - `FilterCriteriaSeeder`: 15 chỉ tiêu tài chính cốt lõi và các ngưỡng chuẩn hóa.
> - `CustomFilterSeeder`: Các bộ lọc mẫu được tạo sẵn.

---

### Bước 6: Khởi chạy máy chủ phát triển
Chạy máy chủ tích hợp của Laravel:
```bash
php artisan serve
```
Mặc định hệ thống sẽ chạy tại:
👉 **`http://127.0.0.1:8000`**

*(Nếu bạn chạy bằng MAMP VirtualHost, có thể cấu hình Document Root trỏ thẳng tới thư mục `MayHem/backend/public`).*

---

## 👥 TÀI KHOẢN ĐĂNG NHẬP & PHÂN QUYỀN (RBAC)

Hệ thống được thiết lập sẵn 3 tài khoản mặc định đại diện cho 3 cấp vai trò:

| Cấp vai trò | Email đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@mayhem.vn` | `admin123` | **Toàn quyền hệ thống**: Quản lý tài khoản, thêm năm tài chính mới, cấu hình ngành, reset danh mục, sao lưu & phục hồi CSDL (Snapshot), khôi phục Audit Log. |
| **Editor** *(Kiểm toán viên trưởng)* | `editor@mayhem.vn` | `editor123` | Xem dữ liệu, áp dụng bộ lọc, chỉnh sửa số liệu báo cáo, xuất Excel, xem lịch sử thay đổi Audit Logs, tùy biến tiêu chí lọc. |
| **Staff** *(Chuyên viên phân tích)* | `staff@mayhem.vn` | `staff123` | Xem báo cáo, áp dụng bộ lọc tài chính, tạo và lưu bộ lọc cá nhân, cập nhật giá trị chỉ tiêu cơ bản. |

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/       # Các Controller xử lý API: Auth, FinancialReport, Screener, Backup
│   │   └── Middleware/            # Middleware bảo mật: AuthenticateMayHem, CheckRoleMayHem
│   └── Models/                    # Các Eloquent Models: Company, FinancialMetric, AuditLog, User,...
├── database/
│   ├── migrations/                # Lịch sử cấu trúc các bảng CSDL
│   └── seeders/                   # Dữ liệu khởi tạo (Users, Financial Data, Criteria, Industries)
├── public/
│   ├── assets/
│   │   ├── css/                   # Stylesheet tùy biến giao diện
│   │   └── js/
│   │       ├── calculations/      # Công thức tính toán tài chính (NIM, CIR, ROE, NPL,...)
│   │       ├── components/        # Web Components: Filters, Custom Filter Builder, Industry Admin Modal...
│   │       ├── core/              # Quản lý API Manager, Auth, Local Cache (IndexedDB), Data Mapper
│   │       └── pages/             # Logic điều khiển trang Dashboard chính
│   └── index.php                  # Điểm đón tiếp nhận request chính của Laravel
├── resources/
│   └── views/
│       ├── auth/login.blade.php   # Giao diện Đăng nhập
│       └── dashboard.blade.php    # Giao diện Dashboard SPA chính
├── routes/
│   ├── api.php                    # Định nghĩa toàn bộ RESTful API V1
│   └── web.php                    # Điều hướng giao diện web (Login, Dashboard, Logout)
├── .env.example                   # Mẫu cấu hình môi trường
├── .gitignore                     # Cấu hình loại bỏ file nhạy cảm và file tạm
├── composer.json                  # Định nghĩa thư viện PHP
└── README.md                      # Báo cáo và hướng dẫn dự án
```

---

## 🎯 CÁC TÍNH NĂNG NỔI BẬT

1. **Ma Trận Đối Chiếu & Báo Cáo Doanh Nghiệp (Financial Matrix)**:
   - Tra cứu tức thì số liệu tài chính của từng ngân hàng hoặc đối chiếu toàn ngành.
   - Sửa trực tiếp số liệu tại từng ô (Inline Editing) với cơ chế xác thực quyền và ghi nhận Audit Log.

2. **Bộ Lọc Đa Chiều Nâng Cao (Smart Screener & Filter Builder)**:
   - Lọc nhanh theo **15 chỉ tiêu tài chính cốt lõi** chuẩn hóa (NIM, CIR, NPL, ROE, CASA, LDR,...).
   - Tùy chọn mở rộng cho phép lọc toàn bộ các khoản mục chi tiết trong Báo Cáo Tài Chính.
   - Lưu, quản lý và chia sẻ các bộ lọc tùy biến theo nhu cầu phân tích.

3. **Trung Tâm Quản Trị Cấu Hình Ngành (Industry Administration)**:
   - Phân hệ dành riêng cho Super Admin nhằm quản lý danh mục các ngành (Ngân hàng, Bất động sản, Bán lẻ,...).
   - Cho phép thêm trường chỉ tiêu tài chính mới, bật/tắt hoặc đặt lại cấu hình mặc định.

4. **Kiểm Toán Số Liệu & Rollback (Audit Trail)**:
   - Ghi lại chi tiết: Người sửa, thời gian, giá trị cũ, giá trị mới, lý do thay đổi.
   - Super Admin có quyền Rollback đưa số liệu trở lại trạng thái ban đầu chỉ với 1 click.

5. **Sao Lưu & Phục Hồi Toàn Diện (System Backup & Restore)**:
   - Tạo bản snapshot dạng JSON nén chứa toàn bộ dữ liệu CSDL.
   - Phục hồi an toàn khi cần di chuyển hệ thống hoặc khôi phục sự cố.

---

## 📡 TÀI LIỆU API ENDPOINTS (V1)

Tất cả các API được đặt dưới tiền tố `/api/v1`:

### 1. Xác thực (Authentication)
- `POST /api/v1/auth/login`: Đăng nhập lấy phiên làm việc (Giới hạn Rate Limit: 10 lần/phút).
- `POST /api/v1/auth/logout`: Đăng xuất và hủy token phiên.
- `GET /api/v1/auth/users`: Lấy danh sách người dùng hệ thống *(Yêu cầu đăng nhập)*.

### 2. Dữ liệu Báo Cáo Tài Chính (Financial Reports)
- `GET /api/v1/financial-reports/matrix`: Lấy ma trận dữ liệu tài chính đa năm của các công ty/ngân hàng.
- `GET /api/v1/companies`: Lấy danh sách các đơn vị niêm yết theo ngành.
- `GET /api/v1/financial-reports/{ticker}`: Lấy chi tiết báo cáo factsheet của 1 ngân hàng theo mã CK.
- `POST /api/v1/financial-reports/update`: Cập nhật giá trị chỉ tiêu tài chính *(Role: Admin, Editor, Staff)*.
- `POST /api/v1/financial-reports/export-excel`: Xuất dữ liệu báo cáo ra file Excel *(Role: Admin, Editor)*.
- `POST /api/v1/financial-reports/new-year`: Mở rộng thêm năm tài chính mới *(Role: Admin)*.

### 3. Bộ Lọc Dữ Liệu & Tiêu Chí (Screener & Criteria)
- `GET /api/v1/screener/industries`: Danh sách các phân ngành kinh tế.
- `GET /api/v1/screener/criteria`: Danh mục tiêu chí xếp hạng & chuẩn hóa.
- `GET /api/v1/screener/filters`: Danh sách các bộ lọc đã lưu.
- `POST /api/v1/screener/save-filter`: Tạo và lưu bộ lọc mới *(Role: Admin, Editor, Staff)*.
- `POST /api/v1/screener/industries`: Thêm/sửa cấu hình ngành *(Role: Admin, Editor)*.

### 4. Kiểm Toán & Sao Lưu (Audit & Backup)
- `GET /api/v1/audit-logs`: Lấy nhật ký thay đổi số liệu *(Role: Admin, Editor)*.
- `POST /api/v1/audit-logs/{id}/rollback`: Hoàn tác giá trị đã sửa *(Role: Admin, Editor)*.
- `GET /api/v1/backup/export`: Xuất snapshot toàn bộ CSDL *(Role: Admin, Editor)*.
- `POST /api/v1/backup/restore`: Khôi phục CSDL từ file snapshot *(Role: Admin)*.

---

## 🔒 CHÍNH SÁCH GIT & BẢO MẬT

Để đảm bảo an toàn mã nguồn và tính bảo mật của dự án khi đẩy lên Git:
- **Tập tin môi trường (`.env`, `.env.*`)**: Tuyệt đối **không được commit** lên Git (đã được cấu hình chặn tự động trong `.gitignore`). Chỉ đẩy file mẫu `.env.example`.
- **Tập tin Python & Script nội bộ**: Các script bóc tách dữ liệu tạm thời (`*.py`), file dữ liệu thô (`*.xlsx`, `*.txt`) và script nháp (`scratch_*.php`, `test_*.mjs`) được loại trừ hoàn toàn khỏi Git tracking để đảm bảo repository chỉ tập trung vào mã nguồn chính của ứng dụng.
- **Bảo mật mật khẩu**: Mật khẩu người dùng luôn được mã hóa một chiều qua thuật toán **Bcrypt** trước khi lưu vào CSDL.