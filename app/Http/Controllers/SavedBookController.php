<?php

namespace App\Http\Controllers;

use App\Models\SavedBook;
use App\Models\Book;
use Illuminate\Http\Request;

class SavedBookController extends Controller
{
    public function index()
{
    $savedBooks = SavedBook::with('book')
        ->where('user_id', auth()->id())
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($savedBook) {
            $savedBook->book->photo_url = $savedBook->book->photo 
                ? url($savedBook->book->photo) 
                : null;
            return $savedBook;
        });
    
    return response()->json([
        'data' => $savedBooks
    ]);
}
    
    public function check($bookId)
    {
        $isSaved = SavedBook::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->exists();
        
        return response()->json(['saved' => $isSaved]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id'
        ]);
        
        $exists = SavedBook::where('user_id', auth()->id())
            ->where('book_id', $request->book_id)
            ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Книга вже збережена'], 409);
        }
        
        $savedBook = SavedBook::create([
            'user_id' => auth()->id(),
            'book_id' => $request->book_id
        ]);
        
        return response()->json(['success' => true, 'data' => $savedBook], 201);
    }
    
    public function destroy($bookId)
    {
        $savedBook = SavedBook::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->first();
        
        if (!$savedBook) {
            return response()->json(['message' => 'Книга не знайдена в бібліотеці'], 404);
        }
        
        $savedBook->delete();
        
        return response()->json(['success' => true, 'message' => 'Книгу видалено з бібліотеки']);
    }
}