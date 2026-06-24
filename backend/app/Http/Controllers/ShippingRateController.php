<?php

namespace App\Http\Controllers;

use App\Models\ShippingRate;
use Illuminate\Http\Request;

class ShippingRateController extends Controller
{
    /**
     * Get all shipping rates (public)
     */
    public function index()
    {
        return response()->json(ShippingRate::orderBy('country')->get());
    }

    /**
     * Add or update a shipping rate (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'country' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0'
        ]);

        $shippingRate = ShippingRate::updateOrCreate(
            ['country' => $validated['country']],
            ['rate' => $validated['rate']]
        );

        return response()->json(['message' => 'Shipping rate saved successfully', 'shipping_rate' => $shippingRate]);
    }

    /**
     * Delete a shipping rate (Admin)
     */
    public function destroy($id)
    {
        $rate = ShippingRate::findOrFail($id);
        $rate->delete();
        
        return response()->json(['message' => 'Shipping rate deleted successfully']);
    }
}
