# 7 Nguyên Tắc Bảo Mật Bất Khả Xâm Phạm (Security Mandates)

Hệ sinh thái MayHem tuân thủ triết lý **Zero-Trust Security**. Bất kỳ tính năng hoặc đoạn mã nào vi phạm 1 trong 7 nguyên tắc dưới đây đều bị **Security Agent** phủ quyết (VETO) và không được phép đưa vào bản phát hành.

---

### Nguyên Tắc 1: Kiểm Soát Quyền Server-Side (Zero-Trust RBAC & Anti-BOLA)
- Mọi thao tác ghi dữ liệu (`POST`, `PUT`, `DELETE`, `PATCH`) phải được kiểm tra quyền hạn nghiêm ngặt tại middleware máy chủ.
- Không bao giờ dựa vào việc ẩn nút bấm hoặc kiểm tra quyền trên giao diện Frontend.
- Chặn đứng lỗ hổng BOLA (Broken Object Level Authorization): Chỉ tài khoản có vai trò `admin` mới được tạo, chỉnh sửa hoặc xóa các bộ lọc mẫu hệ thống (`is_preset = true`).

### Nguyên Tắc 2: Bất Khả Thoái Thác Nhật Ký Kiểm Toán (Audit Non-repudiation)
- Định danh người thao tác (`actor`, `user_role`, `user_id`) phải được trích xuất trực tiếp từ token xác thực hợp lệ trên máy chủ.
- Nghiêm cấm chấp nhận hoặc tin cậy các trường `user_role`, `actor` do client gửi trong request body.
- Mọi sự điều chỉnh số liệu tài chính sau kiểm toán phải có log đối chiếu giá trị cũ (`old_value`) và giá trị mới (`new_value`).

### Nguyên Tắc 3: Phòng Ngừa XSS Bằng Mã Hóa Đầu Ra Toàn Diện (Universal Output Encoding)
- Toàn bộ chuỗi văn bản do người dùng nhập (tên bộ lọc, công thức tiêu chí, nhãn hiển thị, mô tả) phải được xử lý qua hàm `escapeHtml()` trước khi chèn vào `innerHTML` hoặc template DOM.
- Nghiêm cấm truyền trực tiếp biến không qua escape vào HTML attributes hoặc template literals.

### Nguyên Tắc 4: Ràng Buộc Dữ Liệu Đầu Vào Chặt Chẽ (Strict Input Whitelisting & Regex)
- Tất cả tham số truy vấn và body phải được kiểm tra kiểu dữ liệu và định dạng nghiêm ngặt.
- Khung năm tài chính (`year`) bắt buộc phải khớp regex `^[12][0-9]{3}$` (năm 4 chữ số hợp lệ từ 1000 đến 2999).
- Mã cổ phiếu / ngân hàng (`bank`, `ticker`) bắt buộc phải khớp regex `^[A-Za-z]{3,4}$`.

### Nguyên Tắc 5: Cách Ly Bí Mật & Triệt Tiêu Cửa Sau (No Backdoors / Demo Token Isolation)
- Trong môi trường sản xuất (`APP_ENV=production`), nghiêm cấm tuyệt đối việc sử dụng các token mẫu tĩnh (`mayhem_demo_admin_token`, v.v.).
- Nếu phát hiện token tĩnh tồn tại trong production mode, middleware phải từ chối truy cập ngay lập tức với mã lỗi `401 Unauthorized`.

### Nguyên Tắc 6: Tính Toàn Vẹn Của Cơ Sở Dữ Liệu & Chống Race Condition
- Các thao tác cập nhật bảng số liệu và tạo audit log phải được thực thi trong cùng một phạm vi bảo vệ dữ liệu, chống xung đột ghi đồng thời (concurrency write contention).

### Nguyên Tắc 7: Phòng Thủ AI Guardrails & Prompt Injection
- Các chuỗi nhập liệu không được chứa các chỉ thị nhằm can thiệp prompt hệ thống của AI (như "Ignore all previous instructions", "Bỏ qua mọi chỉ dẫn trước đó").
- AI Agent không được giải mã hay hiển thị các biến môi trường nhạy cảm (`.env`, `DB_PASSWORD`, `APP_KEY`, API Keys) cho người dùng cuối.
