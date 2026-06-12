<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_provider')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_provider', 'tracking_number', 'shipping_address', 'phone', 'total_amount']);
        });
    }
};
