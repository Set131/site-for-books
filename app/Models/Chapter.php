<?php
// app/Models/Chapter.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Parsedown;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'chapter_number',
        'title',
        'content_markdown',
        'content_html',
        'views'
    ];

    // Автоматично конвертуємо Markdown в HTML при збереженні
    protected static function booted()
    {
        static::saving(function ($chapter) {
            if ($chapter->isDirty('content_markdown')) {
                $parsedown = new Parsedown();
                $chapter->content_html = $parsedown->text($chapter->content_markdown);
            }
        });
    }

    // Аксесор для отримання HTML (з кешу або конвертуємо на льоту)
    public function getHtmlAttribute()
    {
        if ($this->content_html) {
            return $this->content_html;
        }
        
        $parsedown = new Parsedown();
        return $parsedown->text($this->content_markdown);
    }

    // Аксесор для отримання raw Markdown
    public function getMarkdownAttribute()
    {
        return $this->content_markdown;
    }

    // Зв'язок з книгою
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // Збільшення переглядів
    public function incrementViews()
    {
        $this->increment('views');
    }
}