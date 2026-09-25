<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MhSector;
use Illuminate\Http\JsonResponse;

class SectorController extends Controller
{
    /**
     * Get all active sectors.
     */
    public function index(): JsonResponse
    {
        $sectors = MhSector::withCount('companies')->get();

        return response()->json([
            'success' => true,
            'data' => $sectors,
        ]);
    }
}
