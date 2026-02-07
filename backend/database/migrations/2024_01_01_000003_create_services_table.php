<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pillar_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['one_off', 'subscription']);
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('details')->nullable();
            $table->string('icon')->nullable();
            $table->decimal('price_from', 10, 2)->nullable();
            $table->string('price_label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['pillar_id', 'type', 'is_active']);
            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
