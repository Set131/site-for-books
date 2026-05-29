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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->integer('chapter_number');
            $table->string('title', 500)->nullable(); // Назва розділу
            $table->longText('content_markdown'); // Зберігаємо Markdown
            $table->longText('content_html')->nullable(); // Кеш сконвертованого HTML
            $table->integer('views')->default(0);
            $table->timestamps();
            
            $table->index(['book_id', 'chapter_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};