<?php

namespace App\Http\Controllers;

use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    /**
     * Store a newly created review in storage (Public Endpoint).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|string',
            'name' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'nullable|string',
            'image_url' => 'nullable|string'
        ]);

        $validated['status'] = 'Pending';

        $review = ProductReview::create($validated);

        return response()->json([
            'message' => 'Review submitted successfully. Pending admin approval.',
            'review' => $review
        ], 201);
    }

    /**
     * Display a listing of approved reviews (Public Endpoint).
     */
    public function indexPublic(Request $request)
    {
        $query = ProductReview::where('status', 'Accepted');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();
        return response()->json($reviews);
    }

    /**
     * Display a listing of ALL reviews (Admin Endpoint).
     */
    public function indexAdmin()
    {
        $reviews = ProductReview::orderBy('created_at', 'desc')->get();
        return response()->json($reviews);
    }

    /**
     * Update the status of a specific review (Admin Endpoint).
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Accepted,Rejected'
        ]);

        $review = ProductReview::findOrFail($id);
        $review->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Review status updated', 'review' => $review]);
    }

    /**
     * Remove the specified review (Admin Endpoint).
     */
    public function destroy($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
