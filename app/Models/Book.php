<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'description', 
        'photo', 
        'user_id', 
        'rating', 
        'age_limit', 
        'tags', 
        'slug',
        'views'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($book) {
            $book->slug = static::generateUniqueSlug($book->title);
        });
    }

    protected static function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $count = static::where('slug', 'LIKE', "$slug%")->count();

        return $count ? "{$slug}-{$count}" : $slug;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class)->orderBy('chapter_number');
    }

    public function incrementViews()
    {
        $this->increment('views');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function updateAverageRating()
    {
        $average = $this->ratings()->avg('rating');
        $this->rating = round($average, 1);
        $this->saveQuietly();
    }
}