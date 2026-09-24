<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MhCompany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Get companies list with search and filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MhCompany::query()->active()->with('sector');

        if ($request->filled('sector_id')) {
            $query->where('sector_id', $request->input('sector_id'));
        }

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        $companies = $query->orderBy('short_name', 'asc')->get();

        return response()->json([
            'success' => true,
            'total' => $companies->count(),
            'data' => $companies,
        ]);
    }

    /**
     * Get single company details.
     */
    public function show(string $ticker): JsonResponse
    {
        $company = MhCompany::with('sector')
            ->where('short_name', strtoupper($ticker))
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $company,
        ]);
    }
}
