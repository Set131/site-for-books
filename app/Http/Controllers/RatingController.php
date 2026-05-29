<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function getUserRating(Book $book)
    {
        $rating = Rating::where('book_id', $book->id)
                        ->where('user_id', auth()->id())
                        ->first();
        
        return response()->json(['rating' => $rating ? $rating->rating : null]);
    }
    
    public function rate(Request $request, Book $book)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:10'
        ]);
        
        $rating = Rating::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'book_id' => $book->id
            ],
            ['rating' => $request->rating]
        );
        
        // Оновлюємо середній рейтинг книги
        $averageRating = $book->ratings()->avg('rating');
        $book->rating = round($averageRating, 1);
        $book->saveQuietly();
        
        return response()->json([
            'success' => true,
            'average_rating' => $book->rating,
            'user_rating' => $rating->rating
        ]);
    }
}