<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * Get a list of all orders.
     */
    public function index()
    {
        $orders = Order::with('product')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    public function updateTracking(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'tracking_provider' => 'required|string|max:255',
            'tracking_number' => 'required|string|max:255',
        ]);

        $order->update([
            'tracking_provider' => $validated['tracking_provider'],
            'tracking_number' => $validated['tracking_number'],
            'status' => 'Shipped'
        ]);

        return response()->json(['message' => 'Tracking updated successfully', 'order' => $order]);
    }

    public function invoice($id)
    {
        $order = Order::with('product')->findOrFail($id);
        // Normally we'd generate a PDF using a package like barryvdh/laravel-dompdf
        // For MVP, we return invoice data to be rendered by JS on the frontend
        return response()->json([
            'invoice_number' => 'INV-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'order' => $order,
            'company_details' => [
                'name' => 'Astra Jewellery',
                'address' => '123 Diamond Street, NY',
            ]
        ]);
    }
}
