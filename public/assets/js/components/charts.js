/**
 * assets/js/components/charts.js
 * Renders and updates trend line charts using Chart.js.
 * Rule: Zero mock data. 100% derived from current filtered records. Zero emoji.
 */

let chartInstance = null;

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48',
  '#84cc16', '#0284c7', '#d946ef', '#f43f5e', '#eab308'
];

export function renderChartSection(container) {
  container.innerHTML = `
    <div id="chartPanelCard" class="hidden p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-slate-200">
        <div>
          <h3 id="chartDynamicTitle" class="text-sm font-bold text-slate-800">Biểu đồ Trực quan hóa Xu hướng</h3>
          <p class="text-xs text-slate-500 mt-0.5">Tự động đồng bộ theo bộ lọc ngân hàng và chỉ tiêu đang chọn</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono font-medium">Chart.js Engine</span>
      </div>
      <div class="chart-container-inner" style="height: 320px;">
        <canvas id="financialTrendCanvas"></canvas>
      </div>
    </div>
  `;
}

export function updateChartData(filteredRecords, years, filterState = {}) {
  const panel = document.getElementById('chartPanelCard');
  const canvas = document.getElementById('financialTrendCanvas');
  const title = document.getElementById('chartDynamicTitle');
  if (!panel || !canvas || panel.classList.contains('hidden')) return;

  const ctx = canvas.getContext('2d');
  const { bank = 'ALL', field = 'ALL' } = filterState;
  const datasets = [];

  if (field !== 'ALL') {
    title.textContent = `Xu hướng Chỉ tiêu: ${field} qua các năm (Top ngân hàng)`;
    const limit = Math.min(filteredRecords.length, 10);
    for (let i = 0; i < limit; i++) {
      const rec = filteredRecords[i];
      const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
      datasets.push({
        label: rec.bank,
        data: years.map(y => rec.values ? rec.values[y] : null),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 3.5,
        borderWidth: 2
      });
    }
  } else if (bank !== 'ALL') {
    title.textContent = `Các chỉ tiêu cốt lõi của ngân hàng: ${bank}`;
    const keyFields = [
      'Tăng trưởng TOI',
      'Biên lãi vận hành (trước DPRR)',
      'Biên lợi nhuận trước thuế',
      'Tăng trưởng lãi ròng sau CĐ thiểu số',
      'Owner Earnings'
    ];
    const bankRecs = filteredRecords.filter(r => keyFields.includes(r.field));
    bankRecs.forEach((rec, i) => {
      const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
      datasets.push({
        label: rec.field,
        data: years.map(y => rec.values ? rec.values[y] : null),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 3.5,
        borderWidth: 2
      });
    });
  } else {
    title.textContent = 'So sánh Tăng trưởng TOI qua các năm giữa các ngân hàng tiêu biểu';
    const toiRecs = filteredRecords.filter(r => r.field === 'Tăng trưởng TOI').slice(0, 8);
    toiRecs.forEach((rec, i) => {
      const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
      datasets.push({
        label: rec.bank,
        data: years.map(y => rec.values ? rec.values[y] : null),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 3.5,
        borderWidth: 2
      });
    });
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded yet');
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: '#334155', font: { family: 'Inter', size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const formattedVal = (val !== null && val !== undefined) ? Number(val).toLocaleString() : '-';
              return ` ${context.dataset.label}: ${formattedVal}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }
        }
      }
    }
  });
}

export function toggleChartVisibility(filteredRecords, years, filterState) {
  const panel = document.getElementById('chartPanelCard');
  const lbl = document.getElementById('lblToggleChart');
  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    if (lbl) lbl.textContent = 'Đóng Biểu đồ';
    updateChartData(filteredRecords, years, filterState);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    panel.classList.add('hidden');
    if (lbl) lbl.textContent = 'Mở Biểu đồ So sánh';
  }
}
