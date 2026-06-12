<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $fillable = [
        'name',
        'discount_percentage',
        'discount_amount',
        'show_on_index',
        'promo_code'
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
