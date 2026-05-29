<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $fillable = ['user_id', 'book_id', 'chapter_id', 'read_at'];
    
    protected $casts = [
        'read_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function book()
    {
        return $this->belongsTo(Book::class);
    }
    
    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}