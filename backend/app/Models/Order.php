<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'customer_name',
        'customer_email',
        'status',
        'tracking_provider',
        'tracking_number',
        'shipping_address',
        'phone',
        'total_amount'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
