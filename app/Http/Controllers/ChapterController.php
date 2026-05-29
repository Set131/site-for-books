<?php
// app/Http/Controllers/ChapterController.php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Chapter;
use App\Models\SavedBook;
use App\models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChapterController extends Controller
{
    public function index(Book $book)
    {
        $chapters = $book->chapters;
        return response()->json($chapters);
    }

    public function show(Book $book, $chapterNumber)
    {
        $chapter = Chapter::where('book_id', $book->id)
                        ->where('chapter_number', $chapterNumber)
                        ->firstOrFail();
        
        $chapter->incrementViews();
        
        $chapter->previous_chapter = Chapter::where('book_id', $book->id)
                                            ->where('chapter_number', '<', $chapterNumber)
                                            ->max('chapter_number');
        
        $chapter->next_chapter = Chapter::where('book_id', $book->id)
                                        ->where('chapter_number', '>', $chapterNumber)
                                        ->min('chapter_number');
        
        return response()->json($chapter);
    }

    private function addToHistory($userId, $bookId, $chapterId)
    {
        // Перевіряємо чи вже є запис за сьогодні для цього розділу
        $existing = \App\Models\History::where('user_id', $userId)
            ->where('chapter_id', $chapterId)
            ->whereDate('read_at', now()->toDateString())
            ->first();
        
        if ($existing) {
            // Оновлюємо час
            $existing->update(['read_at' => now()]);
        } else {
            // Створюємо новий запис
            \App\Models\History::create([
                'user_id' => $userId,
                'book_id' => $bookId,
                'chapter_id' => $chapterId,
                'read_at' => now()
            ]);
        }
        
        // Видаляємо записи старші за 7 днів
        \App\Models\History::where('user_id', $userId)
            ->where('read_at', '<', now()->subDays(7))
            ->delete();
    }

    // Створити розділ
    public function store(Request $request, Book $book)
    {
        $request->validate([
            'chapter_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:500',
            'content_markdown' => 'required|string'
        ]);

        // Перевіряємо чи є розділ з таким номером
        $exists = Chapter::where('book_id', $book->id)
                        ->where('chapter_number', $request->chapter_number)
                        ->exists();
        
        if ($exists) {
            return response()->json(['error' => 'Розділ з таким номером вже існує'], 422);
        }

        $chapter = Chapter::create([
            'book_id' => $book->id,
            'chapter_number' => $request->chapter_number,
            'title' => $request->title,
            'content_markdown' => $request->content_markdown
        ]);

        return response()->json($chapter, 201);
    }

    // Оновити розділ
    public function update(Request $request, Book $book, $chapterNumber)
    {
        $chapter = Chapter::where('book_id', $book->id)
                         ->where('chapter_number', $chapterNumber)
                         ->firstOrFail();

        $request->validate([
            'title' => 'nullable|string|max:500',
            'content_markdown' => 'required|string'
        ]);

        $chapter->update([
            'title' => $request->title,
            'content_markdown' => $request->content_markdown
        ]);

        return response()->json($chapter);
    }

    // Видалити розділ
    public function destroy(Book $book, $chapterNumber)
    {
        $chapter = Chapter::where('book_id', $book->id)
                         ->where('chapter_number', $chapterNumber)
                         ->firstOrFail();
        
        $chapter->delete();
        
        return response()->json(['message' => 'Розділ видалено']);
    }

    public function latestChapters(Request $request)
    {
        $limit = $request->query('limit', 10);
        
        $chapters = Chapter::with('book')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($chapter) {
                return [
                    'id' => $chapter->id,
                    'chapter_number' => $chapter->chapter_number,
                    'title' => $chapter->title,
                    'created_at' => $chapter->created_at,
                    'book_title' => $chapter->book->title,
                    'book_slug' => $chapter->book->slug,
                    'book_photo' => $chapter->book->photo ? url($chapter->book->photo) : null,
                ];
            });
        
        return response()->json($chapters);
    }

    public function libraryChapters(Request $request)
    {
        $limit = $request->query('limit', 10);
        $userId = auth()->id();
        
        // Отримуємо ID книг, які користувач додав в бібліотеку
        $savedBookIds = SavedBook::where('user_id', $userId)->pluck('book_id');
        
        // Отримуємо останні глави тільки з цих книг
        $chapters = Chapter::with('book')
            ->whereIn('book_id', $savedBookIds)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($chapter) {
                return [
                    'id' => $chapter->id,
                    'chapter_number' => $chapter->chapter_number,
                    'title' => $chapter->title,
                    'created_at' => $chapter->created_at,
                    'book_title' => $chapter->book->title,
                    'book_slug' => $chapter->book->slug,
                    'book_photo' => $chapter->book->photo ? url($chapter->book->photo) : null,
                ];
            });
        
        return response()->json($chapters);
    }
}