<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomFilter;
use App\Models\FilterCriterion;
use App\Models\FilterIndustryConfig;
use Database\Seeders\FilterCriteriaSeeder;
use Database\Seeders\FilterIndustryConfigSeeder;

class ScreenerController extends Controller
{
    /**
     * GET /api/v1/screener/filters
     * Returns custom filters, optionally filtered by industry.
     */
    public function index(Request $request)
    {
        $industry = $request->query('industry', 'NGAN_HANG');
        $query = CustomFilter::query();
        if ($industry && $industry !== 'ALL') {
            $query->where(function($q) use ($industry) {
                $q->where('industry', $industry)
                  ->orWhereNull('industry');
            });
        }
        $filters = $query->orderBy('is_preset', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $filters->count(),
            'data' => $filters
        ]);
    }

    /**
     * GET /api/v1/screener/presets
     * Returns pre-configured banking filter presets.
     */
    public function getPresets(Request $request)
    {
        $presets = CustomFilter::where('is_preset', true)->get();
        return response()->json([
            'status' => 'success',
            'data' => $presets
        ]);
    }

    /**
     * POST /api/v1/screener/filters (and alias save-filter)
     * Creates new custom filter.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'conditions' => 'required|array',
            'industry' => 'nullable|string'
        ]);

        $authUser = $request->attributes->get('auth_user');
        $userRole = strtolower($authUser['role'] ?? 'staff');
        $isPreset = $request->boolean('is_preset', false);

        // Security Mandate 1: Only admin can create system presets
        if ($isPreset && $userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'status' => 'forbidden',
                'message' => 'Lỗi bảo mật (403 Forbidden): Chỉ tài khoản Quản trị viên cấp cao (Admin) mới có quyền tạo bộ lọc mẫu hệ thống (is_preset=true).'
            ], 403);
        }

        // Sanitize name to prevent stored script injection
        $cleanName = $this->sanitizeInputString($request->input('name'));
        if (empty($cleanName)) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tên bộ lọc không hợp lệ hoặc chứa mã độc hại không an toàn.'
            ], 422);
        }

        $cleanConditions = $this->sanitizeConditions($request->input('conditions'));

        $filter = CustomFilter::create([
            'name' => $cleanName,
            'industry' => $request->input('industry', 'NGAN_HANG'),
            'conditions' => $cleanConditions,
            'is_preset' => $isPreset
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã tạo bộ lọc mới thành công',
            'filter' => $filter,
            'filter_id' => $filter->id
        ], 201);
    }

    /**
     * PUT /api/v1/screener/filters/{id}
     * Updates an existing custom filter.
     */
    public function update(Request $request, $id)
    {
        $filter = CustomFilter::findOrFail($id);
        $authUser = $request->attributes->get('auth_user');
        $userRole = strtolower($authUser['role'] ?? 'staff');

        // Security Mandate 1: Only admin can modify system presets
        if ($filter->is_preset && $userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'status' => 'forbidden',
                'message' => 'Lỗi bảo mật (403 Forbidden): Bộ lọc này là bộ lọc mẫu chuẩn của hệ thống (Preset). Chỉ Admin mới có quyền chỉnh sửa.'
            ], 403);
        }

        // Security Mandate 1: Non-admin cannot promote a filter to preset
        if ($request->has('is_preset') && $request->boolean('is_preset') && $userRole !== 'admin') {
            return response()->json([
                'success' => false,
                'status' => 'forbidden',
                'message' => 'Lỗi bảo mật (403 Forbidden): Bạn không có quyền chuyển bộ lọc thành bộ lọc mẫu hệ thống.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'conditions' => 'sometimes|array',
            'industry' => 'nullable|string',
            'is_preset' => 'nullable|boolean'
        ]);

        if (isset($validated['name'])) {
            $cleanName = $this->sanitizeInputString($validated['name']);
            if (empty($cleanName)) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Tên bộ lọc không hợp lệ hoặc chứa mã độc hại không an toàn.'
                ], 422);
            }
            $validated['name'] = $cleanName;
        }

        if (isset($validated['conditions'])) {
            $validated['conditions'] = $this->sanitizeConditions($validated['conditions']);
        }

        $filter->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật bộ lọc '{$filter->name}' thành công",
            'filter' => $filter
        ]);
    }

    /**
     * DELETE /api/v1/screener/filters/{id}
     * Deletes a custom filter.
     */
    public function destroy(Request $request, $id)
    {
        $filter = CustomFilter::find($id);
        if (!$filter) {
            $num = preg_replace('/[^0-9]/', '', (string)$id);
            if (!empty($num)) {
                $filter = CustomFilter::find($num);
            }
        }
        if (!$filter && $request->has('name')) {
            $filter = CustomFilter::where('name', $request->input('name'))->first();
        }

        if (!$filter) {
            return response()->json([
                'status' => 'success',
                'message' => 'Bộ lọc không tồn tại hoặc đã được xóa trước đó.'
            ]);
        }

        $authUser = $request->attributes->get('auth_user');
        $userRole = strtolower($authUser['role'] ?? 'staff');

        // Allow authenticated users to delete filters/presets
        $name = $filter->name;
        $filter->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Đã xóa bộ lọc '{$name}' thành công"
        ]);
    }

    /**
     * POST /api/v1/screener/save-filter (Legacy alias)
     */
    public function saveFilter(Request $request)
    {
        return $this->store($request);
    }

    /**
     * GET /api/v1/screener/criteria
     * Returns criteria list, optionally filtered by industry.
     */
    public function getCriteria(Request $request)
    {
        $industry = $request->query('industry');
        $query = FilterCriterion::query();

        if ($industry && $industry !== 'ALL') {
            $query->where(function ($q) use ($industry) {
                $q->where('industry', $industry)
                  ->orWhere('industry', 'ALL');
            });
        }

        $criteria = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $criteria->count(),
            'data' => $criteria
        ]);
    }

    /**
     * POST /api/v1/screener/criteria
     * Creates a new benchmark criterion.
     */
    public function storeCriterion(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'field' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:50',
            'mode' => 'nullable|string|max:50',
            'operator' => 'nullable|string|max:10',
            'value' => 'nullable|numeric',
            'display_value' => 'nullable|string|max:100',
            'displayValue' => 'nullable|string|max:100',
            'compare_with_field' => 'nullable|string|max:255',
            'compareWithField' => 'nullable|string|max:255',
            'time_scope' => 'nullable|string|max:50',
            'timeScope' => 'nullable|string|max:50'
        ]);

        $cleanName = $this->sanitizeInputString($request->input('name'));
        $cleanField = $this->sanitizeInputString($request->input('field'));
        if (empty($cleanName) || empty($cleanField)) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Tên hoặc chỉ tiêu tài chính không hợp lệ.'
            ], 422);
        }

        $id = $request->input('id');
        if (empty($id)) {
            $id = 'crit_custom_' . time() . '_' . substr(md5(uniqid()), 0, 4);
        } else {
            $id = $this->sanitizeInputString($id);
        }

        $displayValue = $request->input('display_value', $request->input('displayValue', ''));
        $compareWithField = $request->input('compare_with_field', $request->input('compareWithField'));
        $timeScope = $request->input('time_scope', $request->input('timeScope', 'latest'));

        $criterion = FilterCriterion::create([
            'id' => $id,
            'name' => $cleanName,
            'field' => $cleanField,
            'category' => $this->sanitizeInputString($request->input('category', 'Tùy biến hệ thống')),
            'industry' => $this->sanitizeInputString($request->input('industry', 'ALL')),
            'mode' => $this->sanitizeInputString($request->input('mode', 'threshold')),
            'operator' => $this->sanitizeInputString($request->input('operator', '>=')),
            'value' => $request->has('value') && is_numeric($request->input('value')) ? (float)$request->input('value') : 0,
            'display_value' => $this->sanitizeInputString((string)$displayValue),
            'compare_with_field' => $compareWithField ? $this->sanitizeInputString((string)$compareWithField) : null,
            'time_scope' => $this->sanitizeInputString((string)$timeScope),
            'is_custom' => true,
            'sort_order' => 999
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Đã tạo tiêu chí '{$criterion->name}' thành công",
            'criterion' => $criterion
        ], 201);
    }

    /**
     * PUT /api/v1/screener/criteria/{id}
     * Updates an existing benchmark criterion.
     */
    public function updateCriterion(Request $request, $id)
    {
        $criterion = FilterCriterion::find($id);
        if (!$criterion) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy tiêu chí cần cập nhật.'
            ], 404);
        }

        $data = [];
        if ($request->has('name')) {
            $data['name'] = $this->sanitizeInputString($request->input('name'));
        }
        if ($request->has('field')) {
            $data['field'] = $this->sanitizeInputString($request->input('field'));
        }
        if ($request->has('category')) {
            $data['category'] = $this->sanitizeInputString($request->input('category'));
        }
        if ($request->has('industry')) {
            $data['industry'] = $this->sanitizeInputString($request->input('industry'));
        }
        if ($request->has('mode')) {
            $data['mode'] = $this->sanitizeInputString($request->input('mode'));
        }
        if ($request->has('operator')) {
            $data['operator'] = $this->sanitizeInputString($request->input('operator'));
        }
        if ($request->has('value')) {
            $data['value'] = is_numeric($request->input('value')) ? (float)$request->input('value') : 0;
        }
        if ($request->has('display_value') || $request->has('displayValue')) {
            $val = $request->input('display_value', $request->input('displayValue'));
            $data['display_value'] = $this->sanitizeInputString((string)$val);
        }
        if ($request->has('compare_with_field') || $request->has('compareWithField')) {
            $cVal = $request->input('compare_with_field', $request->input('compareWithField'));
            $data['compare_with_field'] = $cVal ? $this->sanitizeInputString((string)$cVal) : null;
        }
        if ($request->has('time_scope') || $request->has('timeScope')) {
            $tVal = $request->input('time_scope', $request->input('timeScope'));
            $data['time_scope'] = $this->sanitizeInputString((string)$tVal);
        }

        $criterion->update($data);

        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật tiêu chí '{$criterion->name}' thành công",
            'criterion' => $criterion
        ]);
    }

    /**
     * DELETE /api/v1/screener/criteria/{id}
     * Deletes a benchmark criterion.
     */
    public function destroyCriterion(Request $request, $id)
    {
        $criterion = FilterCriterion::find($id);
        if (!$criterion) {
            return response()->json([
                'status' => 'success',
                'message' => 'Tiêu chí không tồn tại hoặc đã được xóa trước đó.'
            ]);
        }

        $name = $criterion->name;
        $criterion->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Đã xóa tiêu chí '{$name}' khỏi danh mục thành công"
        ]);
    }

    /**
     * POST /api/v1/screener/criteria/reset
     * Resets all criteria back to default Seeder baseline.
     */
    public function resetCriteria(Request $request)
    {
        $seeder = new FilterCriteriaSeeder();
        $seeder->run();

        $all = FilterCriterion::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Đã khôi phục toàn bộ danh mục tiêu chí chuẩn hóa về mặc định hệ thống thành công!',
            'count' => $all->count(),
            'data' => $all
        ]);
    }

    /**
     * GET /api/v1/screener/industries
     * Returns all active industry filter configurations.
     */
    public function getIndustries(Request $request)
    {
        $all = $request->boolean('all', false);
        $query = FilterIndustryConfig::query();
        if (!$all) {
            $query->where('is_active', true);
        }
        $configs = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'count' => $configs->count(),
            'data' => $configs
        ]);
    }

    /**
     * GET /api/v1/screener/industries/{id}
     * Returns a specific industry configuration.
     */
    public function getIndustry(Request $request, $id)
    {
        $config = FilterIndustryConfig::find($id);
        if (!$config) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy cấu hình ngành được yêu cầu.'
            ], 404);
        }

        $criteria = FilterCriterion::where('industry', $id)->orderBy('sort_order', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $config,
            'criteria' => $criteria
        ]);
    }

    /**
     * POST /api/v1/screener/industries
     * Creates a new industry filter configuration.
     */
    public function storeIndustry(Request $request)
    {
        $request->validate([
            'id' => 'required|string|max:50|unique:filter_industry_configs,id',
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:100',
            'code_prefix' => 'nullable|string|max:20',
            'item_label' => 'nullable|string|max:100',
            'item_count_label' => 'nullable|string|max:100',
            'tickers' => 'required|array',
            'quick_tickers' => 'nullable|array',
            'fields' => 'required|array',
            'criteria' => 'nullable|array',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        $cleanId = strtoupper(preg_replace('/[^A-Za-z0-9_]/', '', $request->input('id')));
        $cleanTickers = array_values(array_filter(array_map(function($t) {
            return strtoupper(trim($this->sanitizeInputString($t)));
        }, $request->input('tickers'))));

        $cleanQuickTickers = array_values(array_filter(array_map(function($t) {
            return strtoupper(trim($this->sanitizeInputString($t)));
        }, $request->input('quick_tickers', []))));

        $cleanFields = array_values(array_filter(array_map(function($f) {
            return trim($this->sanitizeInputString($f));
        }, $request->input('fields'))));

        $itemLabel = $this->sanitizeInputString($request->input('item_label', 'Doanh nghiệp'));
        $itemCountLabel = $this->sanitizeInputString($request->input('item_count_label', count($cleanTickers) . ' mã'));

        $config = FilterIndustryConfig::create([
            'id' => $cleanId,
            'name' => $this->sanitizeInputString($request->input('name')),
            'short_name' => $this->sanitizeInputString($request->input('short_name')),
            'code_prefix' => $this->sanitizeInputString($request->input('code_prefix', $cleanId)),
            'item_label' => $itemLabel,
            'item_count_label' => $itemCountLabel,
            'tickers' => $cleanTickers,
            'quick_tickers' => $cleanQuickTickers,
            'fields' => $cleanFields,
            'sort_order' => (int)$request->input('sort_order', 99),
            'is_active' => $request->boolean('is_active', true)
        ]);

        if ($request->has('criteria') && is_array($request->input('criteria'))) {
            foreach ($request->input('criteria') as $idx => $crit) {
                if (empty($crit['field'])) continue;
                $cleanField = $this->sanitizeInputString($crit['field']);
                $cleanOp = $this->sanitizeInputString($crit['operator'] ?? '>=');
                $critVal = isset($crit['value']) && is_numeric($crit['value']) ? (float)$crit['value'] : null;
                $dispVal = $this->sanitizeInputString($crit['display_value'] ?? (string)($critVal ?? ''));
                $cleanName = $this->sanitizeInputString($crit['name'] ?? ($cleanField . ' ' . $cleanOp . ' ' . $dispVal));
                $cat = $this->sanitizeInputString($crit['category'] ?? 'Chỉ tiêu tài chính');
                $critId = !empty($crit['id']) 
                    ? $this->sanitizeInputString($crit['id']) 
                    : ('crit_' . strtolower($cleanId) . '_' . substr(md5($cleanField), 0, 8));

                FilterCriterion::create([
                    'id' => $critId,
                    'name' => $cleanName,
                    'field' => $cleanField,
                    'category' => $cat,
                    'industry' => $cleanId,
                    'mode' => 'threshold',
                    'operator' => $cleanOp,
                    'value' => $critVal,
                    'display_value' => $dispVal,
                    'is_custom' => true,
                    'sort_order' => $idx + 1
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Đã tạo cấu hình ngành '{$config->name}' thành công",
            'data' => $config
        ], 201);
    }

    /**
     * PUT /api/v1/screener/industries/{id}
     * Updates an existing industry filter configuration (edit tickers, quick tickers, fields, name).
     */
    public function updateIndustry(Request $request, $id)
    {
        $config = FilterIndustryConfig::find($id);
        if (!$config) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy cấu hình ngành cần cập nhật.'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'short_name' => 'sometimes|string|max:100',
            'code_prefix' => 'nullable|string|max:20',
            'item_label' => 'nullable|string|max:100',
            'item_count_label' => 'nullable|string|max:100',
            'tickers' => 'sometimes|array',
            'quick_tickers' => 'nullable|array',
            'fields' => 'sometimes|array',
            'criteria' => 'nullable|array',
            'sort_order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean'
        ]);

        $updates = [];

        if ($request->has('name')) {
            $updates['name'] = $this->sanitizeInputString($request->input('name'));
        }
        if ($request->has('short_name')) {
            $updates['short_name'] = $this->sanitizeInputString($request->input('short_name'));
        }
        if ($request->has('code_prefix')) {
            $updates['code_prefix'] = $this->sanitizeInputString($request->input('code_prefix'));
        }
        if ($request->has('item_label')) {
            $updates['item_label'] = $this->sanitizeInputString($request->input('item_label'));
        }
        if ($request->has('item_count_label')) {
            $updates['item_count_label'] = $this->sanitizeInputString($request->input('item_count_label'));
        }
        if ($request->has('tickers')) {
            $updates['tickers'] = array_values(array_filter(array_map(function($t) {
                return strtoupper(trim($this->sanitizeInputString($t)));
            }, $request->input('tickers'))));
            // Automatically adjust item_count_label if not explicitly provided
            if (!$request->has('item_count_label')) {
                $label = $updates['item_label'] ?? $config->item_label;
                $updates['item_count_label'] = count($updates['tickers']) . ' ' . strtolower($label);
            }
        }
        if ($request->has('quick_tickers')) {
            $updates['quick_tickers'] = array_values(array_filter(array_map(function($t) {
                return strtoupper(trim($this->sanitizeInputString($t)));
            }, $request->input('quick_tickers'))));
        }
        if ($request->has('fields')) {
            $updates['fields'] = array_values(array_filter(array_map(function($f) {
                return trim($this->sanitizeInputString($f));
            }, $request->input('fields'))));
        }
        if ($request->has('sort_order')) {
            $updates['sort_order'] = (int)$request->input('sort_order');
        }
        if ($request->has('is_active')) {
            $updates['is_active'] = $request->boolean('is_active');
        }

        $config->update($updates);

        if ($request->has('criteria') && is_array($request->input('criteria'))) {
            $incomingIds = [];
            foreach ($request->input('criteria') as $idx => $crit) {
                if (empty($crit['field'])) continue;
                $cleanField = $this->sanitizeInputString($crit['field']);
                $cleanOp = !empty($crit['operator']) ? $this->sanitizeInputString($crit['operator']) : null;
                $critVal = isset($crit['value']) && is_numeric($crit['value']) ? (float)$crit['value'] : null;
                $dispVal = $this->sanitizeInputString($crit['display_value'] ?? $crit['displayValue'] ?? (string)($critVal ?? ''));
                $cleanName = $this->sanitizeInputString($crit['name'] ?? ($cleanField . ' ' . ($cleanOp ?? '') . ' ' . $dispVal));
                $cat = $this->sanitizeInputString($crit['category'] ?? 'Chỉ tiêu tài chính');
                $mode = $this->sanitizeInputString($crit['mode'] ?? 'threshold');
                $timeScope = $this->sanitizeInputString($crit['time_scope'] ?? $crit['timeScope'] ?? 'latest');
                $compareWith = !empty($crit['compare_with_field']) ? $this->sanitizeInputString($crit['compare_with_field']) : null;
                $critId = !empty($crit['id'])
                    ? $this->sanitizeInputString($crit['id'])
                    : ('crit_' . strtolower($id) . '_' . substr(md5($cleanName . '_' . $idx), 0, 10));

                $incomingIds[] = $critId;

                FilterCriterion::updateOrCreate(
                    ['id' => $critId],
                    [
                        'name' => $cleanName,
                        'field' => $cleanField,
                        'category' => $cat,
                        'industry' => $id,
                        'mode' => $mode,
                        'operator' => $cleanOp,
                        'value' => $critVal,
                        'display_value' => $dispVal,
                        'time_scope' => $timeScope,
                        'compare_with_field' => $compareWith,
                        'is_custom' => true,
                        'sort_order' => $idx + 1
                    ]
                );
            }

            if (!empty($incomingIds)) {
                FilterCriterion::where('industry', $id)->whereNotIn('id', $incomingIds)->delete();
            }
        }

        $savedCriteria = FilterCriterion::where('industry', $id)->orderBy('sort_order', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật cấu hình ngành '{$config->name}' và các tiêu chí tài chính thành công",
            'data' => $config,
            'criteria' => $savedCriteria
        ]);
    }

    /**
     * DELETE /api/v1/screener/industries/{id}
     * Deletes an industry filter configuration.
     */
    public function destroyIndustry(Request $request, $id)
    {
        $config = FilterIndustryConfig::find($id);
        if (!$config) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy cấu hình ngành cần xóa.'
            ], 404);
        }

        $name = $config->name;
        $config->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Đã xóa cấu hình ngành '{$name}' thành công"
        ]);
    }

    /**
     * POST /api/v1/screener/industries/reset
     * Resets industry filter configurations to system defaults.
     */
    public function resetIndustries(Request $request)
    {
        $seeder = new FilterIndustryConfigSeeder();
        $seeder->run();

        $all = FilterIndustryConfig::where('is_active', true)->orderBy('sort_order', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Đã khôi phục toàn bộ cấu hình ngành về mặc định hệ thống thành công!',
            'count' => $all->count(),
            'data' => $all
        ]);
    }

    /**
     * Defense-in-Depth XSS Sanitization:
     * 1. Removes dangerous executable blocks (script, style, iframe, object, embed) along with their inner content.
     * 2. Removes any remaining HTML/XML tags.
     */
    private function sanitizeInputString(?string $input): string
    {
        if ($input === null) return '';
        $cleaned = preg_replace('/<(script|style|iframe|object|embed)\b[^>]*>(.*?)<\/\1>/is', '', (string)$input);
        $cleaned = strip_tags($cleaned);
        return trim($cleaned);
    }

    /**
     * Sanitizes all fields within the conditions array.
     */
    private function sanitizeConditions(?array $conditions): array
    {
        if (!is_array($conditions)) return [];
        $clean = [];
        foreach ($conditions as $c) {
            if (!is_array($c)) continue;
            $clean[] = [
                'id' => isset($c['id']) ? $this->sanitizeInputString((string)$c['id']) : null,
                'field' => isset($c['field']) ? $this->sanitizeInputString((string)$c['field']) : '',
                'operator' => isset($c['operator']) ? $this->sanitizeInputString((string)$c['operator']) : '>=',
                'value' => isset($c['value']) && is_numeric($c['value']) ? (float)$c['value'] : 0,
                'displayValue' => isset($c['displayValue']) ? $this->sanitizeInputString((string)$c['displayValue']) : null,
                'timeScope' => isset($c['timeScope']) ? $this->sanitizeInputString((string)$c['timeScope']) : 'latest',
                'category' => isset($c['category']) ? $this->sanitizeInputString((string)$c['category']) : null,
                'name' => isset($c['name']) ? $this->sanitizeInputString((string)$c['name']) : null
            ];
        }
        return $clean;
    }
}
