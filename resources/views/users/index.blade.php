@extends('layouts.app')

@section('title', 'MAYHEM - Quản Trị Người Dùng & Phân Quyền Hệ Thống')
@section('meta_description', 'Quản lý tài khoản người dùng, phân quyền truy cập và kiểm soát dữ liệu tài chính MayHem.')

@section('content')

  <!-- Greeting Hero & 3 Stat Snapshot Cards -->
  <section class="max-w-[1440px] w-full mx-auto px-9 pt-6 pb-6">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      
      <!-- Left: Greeting Typography -->
      <div class="space-y-0.5">
        <p class="text-[11px] uppercase tracking-wider text-[#818181] font-semibold">Security & Access Management</p>
        <h1 class="text-[28px] font-bold text-[#051650] leading-tight">Quản Lý Người Dùng & Phân Quyền</h1>
        <p class="text-[13px] text-[#818181]">Phân quyền kiểm toán viên, chuyên viên phân tích và kiểm soát truy cập hệ thống.</p>
      </div>

      <!-- Right: 3 Stats Cards -->
      <div class="flex flex-wrap sm:flex-nowrap gap-[20px] w-full lg:w-auto">
        <div class="bg-white rounded-xl p-4 w-[180px] h-[82px] flex flex-col justify-between shadow-sm border border-[#D7D7D7]/40">
          <span class="text-[11px] font-semibold text-[#818181] uppercase">TỔNG NGƯỜI DÙNG</span>
          <div class="flex items-center justify-between">
            <span class="text-[22px] font-bold text-[#051650]">{{ $totalUsers }}</span>
            <span class="text-xs text-[#C8997D] font-bold">Tài khoản</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 w-[180px] h-[82px] flex flex-col justify-between shadow-sm border border-[#D7D7D7]/40">
          <span class="text-[11px] font-semibold text-[#818181] uppercase">ĐANG HOẠT ĐỘNG</span>
          <div class="flex items-center justify-between">
            <span class="text-[22px] font-bold text-emerald-700">{{ $activeUsers }}</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 w-[180px] h-[82px] flex flex-col justify-between shadow-sm border border-[#D7D7D7]/40">
          <span class="text-[11px] font-semibold text-[#818181] uppercase">QUẢN TRỊ VIÊN</span>
          <div class="flex items-center justify-between">
            <span class="text-[22px] font-bold text-[#051650]">{{ $adminCount }}</span>
            <span class="text-xs text-blue-700 font-bold">Admin</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Container -->
  <main class="max-w-[1440px] w-full mx-auto px-9 pb-12 flex-1 space-y-5">
    
    <!-- Controls Toolbar: Search, Filters & Action Button -->
    <div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/70 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
      
      <!-- Search & Filters -->
      <form method="GET" action="{{ route('users.index') }}" class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div class="relative w-full sm:w-64">
          <input type="text" 
                 name="search"
                 value="{{ request('search') }}"
                 placeholder="Tìm theo tên hoặc email..." 
                 class="w-full h-[32px] pl-8 pr-3 text-xs bg-[#F8F9FA] border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650] focus:bg-white transition-colors">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#818181]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <select name="role" onchange="this.form.submit()"
                class="h-[32px] bg-white border border-[#D7D7D7] rounded-lg px-3 text-xs text-[#323232] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
          <option value="">Tất cả vai trò</option>
          <option value="admin" {{ request('role') === 'admin' ? 'selected' : '' }}>Admin (Quản trị viên)</option>
          <option value="editor" {{ request('role') === 'editor' ? 'selected' : '' }}>Editor (Kiểm toán viên)</option>
          <option value="staff" {{ request('role') === 'staff' ? 'selected' : '' }}>Staff (Chuyên viên)</option>
        </select>

        <select name="status" onchange="this.form.submit()"
                class="h-[32px] bg-white border border-[#D7D7D7] rounded-lg px-3 text-xs text-[#323232] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
          <option value="">Tất cả trạng thái</option>
          <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Hoạt động</option>
          <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Đã khóa</option>
        </select>

        @if(request()->hasAny(['search', 'role', 'status']))
          <a href="{{ route('users.index') }}" class="text-[#818181] hover:text-[#051650] text-[11px] underline">Xóa lọc</a>
        @endif
      </form>

      <!-- Button Add New User -->
      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <button type="button" id="openAddUserModalBtn"
                class="h-[32px] px-4 rounded-full bg-[#051650] text-white hover:bg-[#0E2168] transition-colors text-[11px] font-bold tracking-wide flex items-center gap-2 shadow-sm">
          <span>+</span>
          <span>THÊM NGƯỜI DÙNG</span>
        </button>
      </div>

    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/70 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-[800px]">
          <thead class="bg-[#F8F9FA] text-[#051650] font-bold text-[11px] uppercase tracking-wider border-b border-[#D7D7D7]">
            <tr class="h-[46px]">
              <th scope="col" class="px-4 text-center w-12 text-[#818181]">STT</th>
              <th scope="col" class="px-4">HỌ VÀ TÊN</th>
              <th scope="col" class="px-4">EMAIL ĐĂNG NHẬP</th>
              <th scope="col" class="px-4 text-center w-36">VAI TRÒ</th>
              <th scope="col" class="px-4 text-center w-32">TRẠNG THÁI</th>
              <th scope="col" class="px-4 text-center w-36">NGÀY TẠO</th>
              <th scope="col" class="px-6 text-right w-52">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E9ECEF] text-xs">
            @forelse($users as $idx => $user)
              <tr class="hover:bg-[#F8F3EC]/30 transition-colors h-[50px]">
                <td class="px-4 text-center text-[#818181] font-semibold">{{ $users->firstItem() + $idx }}</td>
                <td class="px-4 font-bold text-[#051650]">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-[#051650] text-[#C8997D] font-bold flex items-center justify-center text-[10px]">
                      {{ strtoupper(substr($user->name, 0, 2)) }}
                    </div>
                    <span>{{ $user->name }}</span>
                  </div>
                </td>
                <td class="px-4 text-[#495057] font-mono">{{ $user->email }}</td>
                <td class="px-4 text-center">
                  @if($user->role === 'admin')
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#051650] text-[#C8997D] border border-[#C8997D]/40">ADMIN</span>
                  @elseif($user->role === 'editor')
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E7F0FD] text-[#1971C2] border border-[#D0EBFF]">KIỂM TOÁN (EDITOR)</span>
                  @else
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F1F3F5] text-[#495057] border border-[#DEE2E6]">CHUYÊN VIÊN (STAFF)</span>
                  @endif
                </td>
                <td class="px-4 text-center">
                  @if($user->isActive())
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Hoạt động
                    </span>
                  @else
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Đã khóa
                    </span>
                  @endif
                </td>
                <td class="px-4 text-center text-[#818181] font-mono text-[11px]">
                  {{ $user->created_at ? $user->created_at->format('d/m/Y') : '-' }}
                </td>
                <td class="px-6 text-right whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-3 text-xs">
                    <!-- Edit Button -->
                    <button type="button" class="edit-user-btn text-[#051650] hover:text-[#C8997D] font-semibold"
                            data-id="{{ $user->id }}"
                            data-name="{{ $user->name }}"
                            data-email="{{ $user->email }}"
                            data-role="{{ $user->role }}"
                            data-status="{{ $user->status }}">
                      Sửa
                    </button>
                    <span class="text-gray-300">|</span>
                    <!-- Reset Pass Button -->
                    <button type="button" class="reset-pass-btn text-amber-700 hover:underline font-medium"
                            data-id="{{ $user->id }}"
                            data-name="{{ $user->name }}">
                      Đổi MK
                    </button>
                    <span class="text-gray-300">|</span>
                    <!-- Toggle Status Button -->
                    <button type="button" class="toggle-status-btn {{ $user->isActive() ? 'text-red-600' : 'text-emerald-600' }} hover:underline font-medium"
                            data-id="{{ $user->id }}"
                            data-status="{{ $user->status }}">
                      {{ $user->isActive() ? 'Khóa' : 'Mở' }}
                    </button>
                    @if($user->email !== 'admin@mayhem.vn')
                      <span class="text-gray-300">|</span>
                      <!-- Delete Button -->
                      <button type="button" class="delete-user-btn text-red-600 hover:text-red-800 font-medium"
                              data-id="{{ $user->id }}"
                              data-name="{{ $user->name }}">
                        Xóa
                      </button>
                    @endif
                  </div>
                </td>
              </tr>
            @empty
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-[#818181]">
                  Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            @endforelse
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-[#F8F9FA] border-t border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#818181]">
        <div>
          Hiển thị <strong>{{ $users->firstItem() ?? 0 }} - {{ $users->lastItem() ?? 0 }}</strong> trên tổng số <strong>{{ $users->total() }}</strong> tài khoản
        </div>
        <div>
          {{ $users->links() }}
        </div>
      </div>
    </div>

  </main>

  <!-- Modals Partial -->
  @include('users.partials.modals')

@endsection

@push('scripts')
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Modal helpers
    function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
    function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#addUserModal, #editUserModal, #resetPassModal').forEach(m => m.classList.add('hidden'));
      });
    });

    document.getElementById('openAddUserModalBtn')?.addEventListener('click', () => {
      openModal('addUserModal');
    });

    // 1. Submit Add User Form
    document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert('Thêm người dùng mới thành công!');
          window.location.reload();
        } else {
          alert(result.message || 'Lỗi khi tạo người dùng');
        }
      } catch (err) {
        alert('Lỗi kết nối máy chủ');
      }
    });

    // 2. Open Edit User Modal
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('editUserId').value = btn.getAttribute('data-id');
        document.getElementById('editUserName').value = btn.getAttribute('data-name');
        document.getElementById('editUserEmail').value = btn.getAttribute('data-email');
        document.getElementById('editUserRole').value = btn.getAttribute('data-role');
        document.getElementById('editUserStatus').value = btn.getAttribute('data-status');
        openModal('editUserModal');
      });
    });

    // Submit Edit User Form
    document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editUserId').value;
      const payload = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value,
      };

      try {
        const res = await fetch(`/api/v1/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert('Cập nhật người dùng thành công!');
          window.location.reload();
        } else {
          alert(result.message || 'Lỗi khi cập nhật người dùng');
        }
      } catch (err) {
        alert('Lỗi kết nối máy chủ');
      }
    });

    // 3. Open Reset Password Modal
    document.querySelectorAll('.reset-pass-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('resetPassUserId').value = btn.getAttribute('data-id');
        document.getElementById('resetPassUserName').textContent = btn.getAttribute('data-name');
        openModal('resetPassModal');
      });
    });

    // Submit Reset Password Form
    document.getElementById('resetPassForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('resetPassUserId').value;
      const password = e.target.querySelector('input[name="password"]').value;

      try {
        const res = await fetch(`/api/v1/users/${id}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({ password }),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          alert('Đặt lại mật khẩu thành công!');
          closeModal('resetPassModal');
          e.target.reset();
        } else {
          alert(result.message || 'Lỗi đặt lại mật khẩu');
        }
      } catch (err) {
        alert('Lỗi kết nối máy chủ');
      }
    });

    // 4. Toggle Status (Lock / Unlock)
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentStatus = btn.getAttribute('data-status');
        const actionText = currentStatus === 'active' ? 'khóa' : 'mở khóa';

        if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này không?`)) {
          return;
        }

        try {
          const res = await fetch(`/api/v1/users/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
          });
          const result = await res.json();
          if (res.ok && result.success) {
            window.location.reload();
          } else {
            alert(result.message || 'Lỗi thao tác');
          }
        } catch (err) {
          alert('Lỗi kết nối máy chủ');
        }
      });
    });

    // 5. Delete User
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');

        if (!confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn tài khoản '${name}' không?`)) {
          return;
        }

        try {
          const res = await fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
          });
          const result = await res.json();
          if (res.ok && result.success) {
            alert('Đã xóa người dùng thành công!');
            window.location.reload();
          } else {
            alert(result.message || 'Lỗi xóa người dùng');
          }
        } catch (err) {
          alert('Lỗi kết nối máy chủ');
        }
      });
    });

  });
</script>
@endpush
