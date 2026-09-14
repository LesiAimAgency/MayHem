import json

with open(r'C:\MAMP\htdocs\MayHem\BaoCaoTaiChinh_NganHang_30ChiTieu.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

table = data['table']

banks_data = {}
for r in table:
    b = r['Mã Ngân Hàng']
    if b not in banks_data:
        banks_data[b] = {}
    banks_data[b][r['Chỉ tiêu']] = r['values']

print("=== CHECKING NEW FORMULAS FOR ALL BANKS 2024 & 2025 ===")
for b, fields in banks_data.items():
    # 1. Thay đổi tỷ lệ chi phí vốn
    cof25 = fields.get('Chi phí vốn bình quân', {}).get('2025')
    cof24 = fields.get('Chi phí vốn bình quân', {}).get('2024')
    if cof25 is not None and cof24 is not None and cof24 != 0:
        c25 = round(abs(cof25) * 10000) / 10000
        c24 = round(abs(cof24) * 10000) / 10000
        growth_cof = (c25 - c24) / c24 if c24 != 0 else None
    else:
        growth_cof = None

    # 2. Chỉ số tự tài trợ
    ocf25 = fields.get('Lưu chuyển tiền thuần từ hoạt động kinh doanh', {}).get('2025')
    dep25 = fields.get('Chi Khấu hao TSCĐ', {}).get('2025') or 0
    div25 = fields.get('Cổ tức trả cổ đông, lợi nhuận đã chia', {}).get('2025') or 0
    denom25 = abs(dep25) + abs(div25)
    stt25 = (ocf25 / denom25) if (ocf25 is not None and denom25 > 0) else None

    if b in ['VPB', 'VCB', 'TCB', 'MBB', 'ACB']:
        print(f"{b}: COF growth = {growth_cof*100 if growth_cof else 0:.2f}%, Tu tai tro = {stt25:.2f} (round={round(stt25) if stt25 else 0})")
