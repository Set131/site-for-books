<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Book;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Book $book)
    {
        $comments = Comment::with('user')
            ->where('book_id', $book->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                $comment->user->avatar_url = $comment->user->avatar_url;
                return $comment;
            });
        
        return response()->json($comments);
    }
    
    public function store(Request $request, Book $book)
    {
        $request->validate([
            'content' => 'required|string|min:1|max:1000'
        ]);
        
        $comment = Comment::create([
            'user_id' => auth()->id(),
            'book_id' => $book->id,
            'content' => $request->content
        ]);
        
        $comment->load('user');
        $comment->user->avatar_url = $comment->user->avatar_url;
        
        return response()->json($comment, 201);
    }
    
    public function destroy(Comment $comment)
    {
        if (auth()->id() !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $comment->delete();
        return response()->json(['message' => 'Коментар видалено']);
    }
}