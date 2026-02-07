<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('action');
            $table->string('request_id')->nullable();
            $table->enum('status', ['pending', 'success', 'failed']);
            $table->string('related_type')->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            $table->json('payload')->nullable();
            $table->json('response')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('http_status')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->timestamps();

            $table->index(['provider', 'action', 'status']);
            $table->index(['related_type', 'related_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_logs');
    }
};
