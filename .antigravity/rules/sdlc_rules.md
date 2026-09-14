# SDLC Collaboration Rules & Feedback Loops (Phiên bản 2.0)

## 1. Nguyên tắc Phản biện Tứ giác (Quadrangular Feedback Loop)
- **BA Agent**: Bảo vệ Người dùng & Trải nghiệm nghiệp vụ $\rightarrow$ Ép **Coder** phải giải quyết các Edge Cases và đảm bảo tính mạch lạc của luồng người dùng.
- **Coder Agent**: Bảo vệ Kiến trúc & Khả năng mở rộng kỹ thuật $\rightarrow$ Đưa ra giải pháp cân bằng giữa hiệu năng và độ phức tạp mã nguồn.
- **Tester Agent**: Tìm kiếm Điểm gãy Logic & Tải nặng $\rightarrow$ Ép **Coder** phải tối ưu thuật toán, xử lý ngoại lệ và vượt qua Stress Test.
- **Security Agent**: Đóng vai trò PenTester với quyền Phủ Quyết (VETO) $\rightarrow$ Ép **Coder** phải tuân thủ 7 Nguyên tắc Bảo mật (Security Mandates), chặn đứng mọi nguy cơ BOLA/IDOR, XSS, Injection và rò rỉ bí mật.

## 2. Tiêu chuẩn Hoàn thành Mở rộng (Definition of Done - DoD v2.0)
Một tính năng chỉ được xem là HOÀN THÀNH và đủ điều kiện lên Production khi:
1. [x] Có Spec và AC chuẩn hóa dạng Gherkin do BA Agent phê duyệt.
2. [x] Code vượt qua 100% kịch bản kiểm thử chức năng & hiệu năng (Stress Test) do Tester Agent thực thi.
3. [x] Đạt chứng nhận an toàn (Zero Vulnerabilities) từ Security Agent qua bộ kịch bản Kiểm thử Xâm nhập (Penetration Test Suite).
4. [x] 100% dữ liệu hiển thị phía client được mã hóa bằng `escapeHtml()` chống Stored/DOM XSS.
5. [x] Mọi thay đổi dữ liệu được xác thực định danh phía server (Audit Non-repudiation).
6. [x] Mã nguồn đã được refactor đồng bộ hoàn chỉnh giữa Backend và Frontend.
