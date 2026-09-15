<?php
$paths = [
    'C:/MAMP/htdocs/MayHem/BaoCaoTaiChinh_NganHang_30ChiTieu.json',
    'C:/MAMP/htdocs/MayHem/backend/public/BaoCaoTaiChinh_NganHang_30ChiTieu.json',
    'C:/MAMP/htdocs/MayHem/backend/public/assets/data/BaoCaoTaiChinh_NganHang_30ChiTieu.json'
];
foreach ($paths as $p) {
    if (!file_exists($p)) continue;
    $d = json_decode(file_get_contents($p), true);
    foreach ($d['table'] ?? [] as $r) {
        $b = $r['Ngân hàng'] ?? ($r['Mã Ngân Hàng'] ?? ($r['bank'] ?? ''));
        $f = $r['Chỉ tiêu'] ?? ($r['field'] ?? '');
        if ($b === 'ABB' && mb_strpos($f, 'Tổng thu nhập hoạt động') !== false) {
            echo "$p | 2015: " . ($r['values']['2015'] ?? $r['2015'] ?? 'null') . "\n";
            break;
        }
    }
}
