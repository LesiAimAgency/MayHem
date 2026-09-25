<!-- MODAL 1: THÊM NGƯỜI DÙNG MỚI -->
<div id="addUserModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl border border-[#D7D7D7] w-full max-w-md p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-gray-100 pb-3">
      <h3 class="text-[16px] font-bold text-[#051650]">Thêm Người Dùng Mới</h3>
      <button type="button" class="close-modal-btn text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
    </div>

    <form id="addUserForm" class="space-y-3.5 text-xs">
      <div>
        <label class="block font-semibold text-[#051650] mb-1">Họ và Tên *</label>
        <input type="text" name="name" required placeholder="Nguyễn Văn A" 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Email Đăng Nhập *</label>
        <input type="email" name="email" required placeholder="user@mayhem.vn" 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Mật Khẩu Khởi Tạo *</label>
        <input type="password" name="password" required minlength="6" placeholder="Tối thiểu 6 ký tự" 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Vai Trò Phân Quyền *</label>
        <select name="role" required class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
          <option value="staff" selected>Chuyên Viên Phân Tích (Staff)</option>
          <option value="editor">Kiểm Toán Viên (Editor)</option>
          <option value="admin">Quản Trị Viên (Admin)</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Trạng Thái</label>
        <select name="status" class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
          <option value="active" selected>Kích hoạt (Active)</option>
          <option value="inactive">Tạm khóa (Inactive)</option>
        </select>
      </div>

      <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
        <button type="button" class="close-modal-btn px-4 py-2 rounded-lg border border-[#D7D7D7] text-[#818181] hover:bg-gray-100 font-semibold">
          Hủy
        </button>
        <button type="submit" class="px-5 py-2 rounded-lg bg-[#051650] text-white hover:bg-[#0E2168] font-bold shadow-sm">
          Lưu Người Dùng
        </button>
      </div>
    </form>
  </div>
</div>

<!-- MODAL 2: SỬA THÔNG TIN NGƯỜI DÙNG -->
<div id="editUserModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl border border-[#D7D7D7] w-full max-w-md p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-gray-100 pb-3">
      <h3 class="text-[16px] font-bold text-[#051650]">Cập Nhật Thông Tin Người Dùng</h3>
      <button type="button" class="close-modal-btn text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
    </div>

    <form id="editUserForm" class="space-y-3.5 text-xs">
      <input type="hidden" name="user_id" id="editUserId">

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Họ và Tên *</label>
        <input type="text" name="name" id="editUserName" required 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Email Đăng Nhập *</label>
        <input type="email" name="email" id="editUserEmail" required 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Vai Trò Phân Quyền *</label>
        <select name="role" id="editUserRole" required class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
          <option value="staff">Chuyên Viên Phân Tích (Staff)</option>
          <option value="editor">Kiểm Toán Viên (Editor)</option>
          <option value="admin">Quản Trị Viên (Admin)</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Trạng Thái</label>
        <select name="status" id="editUserStatus" class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
          <option value="active">Kích hoạt (Active)</option>
          <option value="inactive">Tạm khóa (Inactive)</option>
        </select>
      </div>

      <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
        <button type="button" class="close-modal-btn px-4 py-2 rounded-lg border border-[#D7D7D7] text-[#818181] hover:bg-gray-100 font-semibold">
          Hủy
        </button>
        <button type="submit" class="px-5 py-2 rounded-lg bg-[#051650] text-white hover:bg-[#0E2168] font-bold shadow-sm">
          Cập Nhật
        </button>
      </div>
    </form>
  </div>
</div>

<!-- MODAL 3: ĐẶT LẠI MẬT KHẨU -->
<div id="resetPassModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl border border-[#D7D7D7] w-full max-w-sm p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-gray-100 pb-3">
      <h3 class="text-[15px] font-bold text-[#051650]">Đặt Lại Mật Khẩu</h3>
      <button type="button" class="close-modal-btn text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
    </div>

    <form id="resetPassForm" class="space-y-3.5 text-xs">
      <input type="hidden" name="user_id" id="resetPassUserId">
      <p class="text-[11px] text-[#818181]">Đang đổi mật khẩu cho: <strong id="resetPassUserName" class="text-[#051650]"></strong></p>

      <div>
        <label class="block font-semibold text-[#051650] mb-1">Mật Khẩu Mới *</label>
        <input type="password" name="password" required minlength="6" placeholder="Tối thiểu 6 ký tự" 
               class="w-full h-8 px-3 border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650]">
      </div>

      <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
        <button type="button" class="close-modal-btn px-4 py-2 rounded-lg border border-[#D7D7D7] text-[#818181] hover:bg-gray-100 font-semibold">
          Hủy
        </button>
        <button type="submit" class="px-5 py-2 rounded-lg bg-amber-700 text-white hover:bg-amber-800 font-bold shadow-sm">
          Lưu Mật Khẩu
        </button>
      </div>
    </form>
  </div>
</div>
