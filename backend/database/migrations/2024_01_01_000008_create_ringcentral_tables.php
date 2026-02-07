<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ringcentral_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_id')->unique();
            $table->string('name')->nullable();
            $table->string('main_number')->nullable();
            $table->string('status')->default('active');
            $table->json('extensions')->nullable();
            $table->timestamps();
        });

        Schema::create('ringcentral_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ringcentral_account_id')->nullable()->constrained()->onDelete('cascade');
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->string('token_type')->default('Bearer');
            $table->integer('expires_in')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('scope')->nullable();
            $table->string('owner_id')->nullable();
            $table->timestamps();
        });

        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ringcentral_id')->unique();
            $table->string('session_id')->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('type', ['voice', 'fax', 'sms']);
            $table->string('action')->nullable();
            $table->string('result')->nullable();
            $table->timestamp('start_time');
            $table->integer('duration')->nullable();
            $table->json('from_data')->nullable();
            $table->json('to_data')->nullable();
            $table->string('recording_url')->nullable();
            $table->foreignId('contact_submission_id')->nullable()->constrained()->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['direction', 'type', 'start_time']);
            $table->index('session_id');
        });

        Schema::create('call_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('call_log_id')->constrained()->onDelete('cascade');
            $table->string('participant_id')->nullable();
            $table->string('phone_number');
            $table->string('name')->nullable();
            $table->string('location')->nullable();
            $table->enum('role', ['from', 'to']);
            $table->timestamps();

            $table->index(['call_log_id', 'role']);
        });

        Schema::create('sms_messages', function (Blueprint $table) {
            $table->id();
            $table->string('ringcentral_id')->unique();
            $table->string('conversation_id')->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->string('from_number');
            $table->string('to_number');
            $table->text('content');
            $table->string('status')->nullable();
            $table->timestamp('sent_at');
            $table->foreignId('contact_submission_id')->nullable()->constrained()->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['direction', 'sent_at']);
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_messages');
        Schema::dropIfExists('call_participants');
        Schema::dropIfExists('call_logs');
        Schema::dropIfExists('ringcentral_tokens');
        Schema::dropIfExists('ringcentral_accounts');
    }
};
