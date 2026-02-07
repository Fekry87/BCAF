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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group', 50)->index(); // e.g., 'header', 'theme', 'footer', 'home', 'about', 'contact'
            $table->string('key', 100);
            $table->text('value')->nullable();
            $table->string('type', 20)->default('string'); // string, json, boolean, integer, file
            $table->timestamps();

            $table->unique(['group', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
