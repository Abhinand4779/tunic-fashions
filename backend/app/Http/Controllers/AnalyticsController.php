<?php

namespace App\Http\Controllers;

use App\Models\PageVisit;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    // Public endpoint: Record a page visit
    public function visit(Request $request)
    {
        $validated = $request->validate([
            'page_name' => 'required|string|max:255'
        ]);

        $today = Carbon::today();

        $visit = PageVisit::firstOrCreate(
            ['page_name' => $validated['page_name'], 'visit_date' => $today]
        );

        if (!$visit->wasRecentlyCreated) {
            $visit->increment('views');
        }

        return response()->json(['message' => 'Visit recorded']);
    }

    // Admin endpoint: Get dashboard stats
    public function dashboard()
    {
        $totalVisits = PageVisit::sum('views');
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total_amount');
        
        $conversionRate = $totalVisits > 0 ? round(($totalOrders / $totalVisits) * 100, 2) : 0;

        return response()->json([
            'total_visits' => $totalVisits,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'conversion_rate_percentage' => $conversionRate
        ]);
    }
}
