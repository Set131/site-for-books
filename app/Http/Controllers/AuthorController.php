<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        // Отримуємо всіх користувачів, які мають хоча б одну книгу
        $authors = User::whereHas('books')
            ->withCount('books')
            ->orderBy('books_count', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                    'books_count' => $user->books_count,
                ];
            });
        
        return response()->json($authors);
    }
    
    public function topActive()
    {
        // Топ 6 авторів за кількістю книг
        $authors = User::whereHas('books')
            ->withCount('books')
            ->orderBy('books_count', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                    'books_count' => $user->books_count,
                ];
            });
        
        return response()->json($authors);
    }
}