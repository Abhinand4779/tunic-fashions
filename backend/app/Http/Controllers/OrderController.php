<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::latest()->get();
        return response()->json($orders);
    }

    public function myOrders(Request $request)
    {
        $orders = Order::where('customer_email', $request->user()->email)->latest()->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'shipping_address' => 'nullable|string',
            'phone' => 'nullable|string',
            'total_amount' => 'nullable|numeric',
        ]);

        $validated['status'] = 'Processing';

        $order = Order::create($validated);

        return response()->json($order, 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string'
        ]);

        $order->update($validated);
        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }
}
