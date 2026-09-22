<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Trung Bình Ngành</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800 p-8">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-blue-700 mb-6">Demo Tính Toán Trung Bình Ngành (Industry Average)</h1>
        
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Công thức tính theo yêu cầu:</h2>
            <ul class="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li><strong>Bước 1:</strong> Tính giá trị trung bình của toàn ngành trong từng năm (Ví dụ: Tổng ROA của 29 ngân hàng năm 2024 / số lượng ngân hàng có dữ liệu).</li>
                <li><strong>Bước 2:</strong> Cột "Trung bình nhiều năm" = Tổng giá trị trung bình của các năm / Tổng số năm có dữ liệu.</li>
            </ul>
        </div>

        <div class="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table class="min-w-full text-sm text-left whitespace-nowrap">
                <thead class="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                    <tr>
                        <th class="px-4 py-3 sticky left-0 bg-slate-100 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Chỉ Tiêu (Indicator)</th>
                        @foreach($years as $year)
                            <th class="px-4 py-3 text-center">{{ $year }}</th>
                        @endforeach
                        <th class="px-4 py-3 text-center text-blue-700 bg-blue-50 border-l border-blue-200 sticky right-0">Trung bình <br/>nhiều năm</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @foreach($results as $index => $row)
                    <tr class="hover:bg-slate-50 transition-colors {{ $index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50' }}">
                        <td class="px-4 py-3 sticky left-0 font-medium text-slate-700 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] {{ $index % 2 === 0 ? 'bg-white' : 'bg-slate-50' }}">
                            {{ $row['Indicator'] }}
                        </td>
                        @foreach($years as $year)
                            <td class="px-4 py-3 text-center font-mono">
                                @if($row[$year] !== null)
                                    @php
                                        // Định dạng số hiển thị cho gọn
                                        $val = $row[$year];
                                        $isPercent = str_contains($row['Indicator'], 'Biên') || str_contains($row['Indicator'], 'Tỷ lệ') || str_contains($row['Indicator'], 'Tỷ suất') || str_contains($row['Indicator'], 'Tăng trưởng');
                                        
                                        if ($isPercent && abs($val) < 10) {
                                            $valStr = number_format($val * 100, 2) . '%';
                                        } else {
                                            $valStr = number_format($val, 2);
                                        }
                                    @endphp
                                    {{ $valStr }}
                                @else
                                    <span class="text-gray-300">-</span>
                                @endif
                            </td>
                        @endforeach
                        <td class="px-4 py-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30 border-l border-gray-200 sticky right-0">
                            @if($row['TotalAverage'] !== null)
                                @php
                                    $val = $row['TotalAverage'];
                                    if ($isPercent && abs($val) < 10) {
                                        $valStr = number_format($val * 100, 2) . '%';
                                    } else {
                                        $valStr = number_format($val, 2);
                                    }
                                @endphp
                                {{ $valStr }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
