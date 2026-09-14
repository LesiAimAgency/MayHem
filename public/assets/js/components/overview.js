/**
 * assets/js/components/overview.js
 * Renders overview KPI summary cards: Bank count, raw metrics, calculated metrics, filtered rows.
 * Rule: Zero mock data.
 */

export function renderOverview(container, stats = {}) {
  const {
    totalBanks = 29,
    rawCount = 30,
    calcCount = 16,
    activeRows = 1334,
    filterStatusText = 'Hiển thị toàn bộ dữ liệu'
  } = stats;

  container.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
      <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-xs font-medium text-slate-500">Ngân hàng khảo sát</span>
        <div class="flex items-baseline gap-1.5 mt-1.5">
          <span id="overviewBankCount" class="text-xl sm:text-2xl font-bold font-mono text-blue-600">${totalBanks}</span>
          <span class="text-xs text-slate-400">tổ chức</span>
        </div>
        <span class="text-[11px] text-slate-400 mt-1">Toàn bộ hệ thống VN</span>
      </div>

      <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-xs font-medium text-slate-500">Chỉ tiêu gốc (Fill)</span>
        <div class="flex items-baseline gap-1.5 mt-1.5">
          <span id="overviewRawCount" class="text-xl sm:text-2xl font-bold font-mono text-emerald-600">${rawCount}</span>
          <span class="text-xs text-slate-400">chỉ tiêu</span>
        </div>
        <span class="text-[11px] text-slate-400 mt-1">Từ BCTC kiểm toán</span>
      </div>

      <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-xs font-medium text-slate-500">Chỉ tiêu tính toán (Tính)</span>
        <div class="flex items-baseline gap-1.5 mt-1.5">
          <span id="overviewCalcCount" class="text-xl sm:text-2xl font-bold font-mono text-purple-600">${calcCount}</span>
          <span class="text-xs text-slate-400">công thức</span>
        </div>
        <span class="text-[11px] text-slate-400 mt-1">Đối chiếu phân tích sâu</span>
      </div>

      <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-xs font-medium text-slate-500">Số dòng đang hiển thị</span>
        <div class="flex items-baseline gap-1.5 mt-1.5">
          <span id="overviewActiveRows" class="text-xl sm:text-2xl font-bold font-mono text-cyan-700">${activeRows.toLocaleString()}</span>
          <span class="text-xs text-slate-400">/ 1.334</span>
        </div>
        <span class="text-[11px] text-slate-400 mt-1">Dữ liệu ma trận năm</span>
      </div>

      <div class="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-xs font-medium text-slate-500">Trạng thái bộ lọc</span>
        <div class="mt-1.5">
          <span id="overviewFilterStatus" class="text-xs font-semibold text-slate-700 line-clamp-2">${filterStatusText}</span>
        </div>
        <span class="text-[11px] text-slate-400 mt-1">Tự động đồng bộ</span>
      </div>
    </div>
  `;
}

export function updateOverviewCounts(activeRows, filterStatusText) {
  const elRows = document.getElementById('overviewActiveRows');
  const elStatus = document.getElementById('overviewFilterStatus');
  if (elRows) elRows.textContent = activeRows.toLocaleString();
  if (elStatus) elStatus.textContent = filterStatusText;
}
