<?php
// app/Http/Controllers/HistoryController.php

namespace App\Http\Controllers;

use App\Models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HistoryController extends Controller
{
    public function index()
    {
        try {
            Log::info('History index started');
            
            $history = History::with(['book', 'chapter'])
                ->where('user_id', auth()->id())
                ->orderBy('read_at', 'desc')
                ->get();
            
            Log::info('History index success', ['count' => $history->count()]);
            
            return response()->json([
                'data' => $history
            ]);
        } catch (\Exception $e) {
            Log::error('History index error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
    
    public function store(Request $request)
    {
        try {
            Log::info('History store started', $request->all());
            
            $validated = $request->validate([
                'book_id' => 'required|exists:books,id',
                'chapter_id' => 'required|exists:chapters,id',
            ]);
            
            $existing = History::where('user_id', auth()->id())
                ->where('chapter_id', $validated['chapter_id'])
                ->whereDate('read_at', now()->toDateString())
                ->first();
            
            if ($existing) {
                $existing->update(['read_at' => now()]);
                Log::info('History updated', ['id' => $existing->id]);
            } else {
                History::create([
                    'user_id' => auth()->id(),
                    'book_id' => $validated['book_id'],
                    'chapter_id' => $validated['chapter_id'],
                    'read_at' => now()
                ]);
                Log::info('History created');
            }
            
            // Видаляємо записи старші за 7 днів
            $deleted = History::where('user_id', auth()->id())
                ->where('read_at', '<', now()->subDays(7))
                ->delete();
            
            Log::info('Old history deleted', ['count' => $deleted]);
            
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('History store error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function destroy()
    {
        try {
            $deleted = History::where('user_id', auth()->id())->delete();
            Log::info('History cleared', ['count' => $deleted]);
            return response()->json(['message' => 'Історію очищено']);
        } catch (\Exception $e) {
            Log::error('History clear error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}