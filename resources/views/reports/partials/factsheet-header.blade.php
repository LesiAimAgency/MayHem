<div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/70 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
  <div>
    <div class="flex items-center gap-2.5 flex-wrap">
      <h2 id="bankHeaderTitle" class="text-[18px] font-bold text-[#051650] leading-tight">
        {{ $factsheet['company']['company_name'] }} ({{ $factsheet['company']['short_name'] }}) - Báo Cáo Kết Quả Hoạt Động Kinh Doanh
      </h2>
      <span id="bankTickerBadge" class="font-bold text-[#1C7ED6] bg-[#EBF3FC] px-2.5 py-0.5 rounded text-xs border border-[#D0EBFF]">{{ $factsheet['company']['short_name'] }}</span>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F3F5] text-[#495057] border border-[#DEE2E6]">BCTC KIỂM TOÁN</span>
    </div>
    <p class="text-xs text-[#818181] mt-1 flex items-center gap-2 flex-wrap">
      <span>Sàn: <strong class="text-[#051650]">{{ $factsheet['company']['exchange'] ?? 'HOSE' }}</strong></span>
      <span class="text-[#D7D7D7]">&bull;</span>
      <span>Chuỗi thời gian: <strong class="text-[#051650]">{{ count($factsheet['years']) }} năm ({{ min($factsheet['years']) ?? 2018 }} &ndash; {{ max($factsheet['years']) ?? 2025 }})</strong></span>
      <span class="text-[#D7D7D7]">&bull;</span>
    
    </p>
  </div>

  <!-- Quick KPI Chips Snapshot -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
    <div class="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-3 py-2 flex flex-col">
      <span class="text-[10px] text-[#818181] font-semibold uppercase">TOI {{ $factsheet['kpis']['toi']['year'] ?? '' }}</span>
      <span id="kpiTOI" class="text-[13px] font-bold font-mono text-[#051650]">
        {{ $factsheet['kpis']['toi']['value'] !== null ? number_format($factsheet['kpis']['toi']['value']) : 'N/A' }}
      </span>
      <span id="kpiTOIGrowth" class="text-[9px] {{ ($factsheet['kpis']['toi']['growth'] ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500' }} font-semibold">
        {{ $factsheet['kpis']['toi']['growth'] !== null ? ($factsheet['kpis']['toi']['growth'] > 0 ? '+' : '') . $factsheet['kpis']['toi']['growth'] . '% YoY' : '' }}
      </span>
    </div>
    <div class="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-3 py-2 flex flex-col">
      <span class="text-[10px] text-[#818181] font-semibold uppercase">CIR {{ $factsheet['kpis']['cir']['year'] ?? '' }}</span>
      <span id="kpiCIR" class="text-[13px] font-bold font-mono text-[#FA5252]">
        {{ $factsheet['kpis']['cir']['value'] !== null ? $factsheet['kpis']['cir']['value'] . '%' : 'N/A' }}
      </span>
      <span class="text-[9px] text-[#818181]">Tỷ lệ chi phí</span>
    </div>
    <div class="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-3 py-2 flex flex-col">
      <span class="text-[10px] text-[#818181] font-semibold uppercase">LỢI NHUẬN TRƯỚC THUẾ</span>
      <span id="kpiPBT" class="text-[13px] font-bold font-mono text-[#051650]">
        {{ $factsheet['kpis']['pbt']['value'] !== null ? number_format($factsheet['kpis']['pbt']['value']) : 'N/A' }}
      </span>
      <span id="kpiPBTGrowth" class="text-[9px] {{ ($factsheet['kpis']['pbt']['growth'] ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500' }} font-semibold">
        {{ $factsheet['kpis']['pbt']['growth'] !== null ? ($factsheet['kpis']['pbt']['growth'] > 0 ? '+' : '') . $factsheet['kpis']['pbt']['growth'] . '% YoY' : '' }}
      </span>
    </div>
    <div class="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-3 py-2 flex flex-col">
      <span class="text-[10px] text-[#818181] font-semibold uppercase">LỢI NHUẬN SAU THUẾ</span>
      <span id="kpiNPAT" class="text-[13px] font-bold font-mono text-emerald-700">
        {{ $factsheet['kpis']['npat']['value'] !== null ? number_format($factsheet['kpis']['npat']['value']) : 'N/A' }}
      </span>
      <span id="kpiNPATGrowth" class="text-[9px] {{ ($factsheet['kpis']['npat']['growth'] ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500' }} font-semibold">
        {{ $factsheet['kpis']['npat']['growth'] !== null ? ($factsheet['kpis']['npat']['growth'] > 0 ? '+' : '') . $factsheet['kpis']['npat']['growth'] . '% YoY' : '' }}
      </span>
    </div>
  </div>
</div>
