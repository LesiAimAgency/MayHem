<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ScreenerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScreenerController extends Controller
{
    public function __construct(
        protected ScreenerService $screenerService
    ) {}

    /**
     * Filter companies based on criteria and selected tickers.
     */
    public function filter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sector_id' => 'nullable|integer',
            'stocks' => 'nullable|array',
            'stocks.*' => 'string|max:10',
            'criteria' => 'nullable|array',
        ]);

        $result = $this->screenerService->screen($validated);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
