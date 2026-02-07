<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->foreignId('pillar_id')->nullable()->constrained()->onDelete('set null');
            $table->text('message');
            $table->enum('status', ['new', 'in_progress', 'synced', 'failed', 'closed'])->default('new');
            $table->string('suitedash_external_id')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->string('source')->default('website');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index('suitedash_external_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};
