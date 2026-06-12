<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    // Public endpoint: Get only offers flagged to show on index
    public function visible()
    {
        return response()->json(Offer::where('show_on_index', true)->get());
    }

    // Admin endpoint: Get all offers
    public function index()
    {
        return response()->json(Offer::all());
    }

    // Admin endpoint
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'show_on_index' => 'boolean',
            'promo_code' => 'nullable|string|unique:offers',
        ]);

        $offer = Offer::create($validated);
        return response()->json($offer, 201);
    }

    // Admin endpoint
    public function update(Request $request, Offer $offer)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'show_on_index' => 'boolean',
            'promo_code' => 'nullable|string|unique:offers,promo_code,' . $offer->id,
        ]);

        $offer->update($validated);
        return response()->json($offer);
    }

    // Admin endpoint
    public function destroy(Offer $offer)
    {
        $offer->delete();
        return response()->json(['message' => 'Offer deleted successfully']);
    }
}
