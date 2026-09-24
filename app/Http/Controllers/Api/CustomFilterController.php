<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MhCustomFilter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomFilterController extends Controller
{
    /**
     * Get all saved filters.
     */
    public function index(Request $request): JsonResponse
    {
        $sectorId = $request->input('sector_id', 1);
        $filters = MhCustomFilter::where('sector_id', $sectorId)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $filters,
        ]);
    }

    /**
     * Store new custom filter.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sector_id' => 'required|integer|exists:mh_sectors,id',
            'filter_name' => 'required|string|max:255',
            'filter_logic' => 'required|array',
        ]);

        $filter = MhCustomFilter::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lưu bộ lọc thành công',
            'data' => $filter,
        ], 201);
    }

    /**
     * Delete custom filter.
     */
    public function destroy(int $id): JsonResponse
    {
        $filter = MhCustomFilter::findOrFail($id);
        $filter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa bộ lọc',
        ]);
    }
}
