<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    // Зберегти повідомлення від користувача
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        $contact = Contact::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
            'user_id' => auth()->id(),
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ваше повідомлення відправлено. Ми відповімо найближчим часом!'
        ]);
    }

    // Отримати всі повідомлення (тільки для адмінів та модераторів)
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isModerator()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }

        $status = $request->query('status');
        $query = Contact::orderBy('created_at', 'desc');
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $contacts = $query->get();
        
        return response()->json($contacts);
    }

    // Отримати одне повідомлення
    public function show($id)
    {
        $user = auth()->user();
        
        if (!$user->isModerator()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }
        
        $contact = Contact::findOrFail($id);
        
        if ($contact->status === 'new') {
            $contact->update(['status' => 'read']);
        }
        
        return response()->json($contact);
    }

    // Відповісти на повідомлення
    public function reply(Request $request, $id)
    {
        $user = auth()->user();
        
        if (!$user->isModerator()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }
        
        $request->validate([
            'reply' => 'required|string|min:1|max:5000'
        ]);
        
        $contact = Contact::findOrFail($id);
        
        $contact->update([
            'admin_reply' => $request->reply,
            'status' => 'replied',
            'replied_at' => now(),
        ]);
        
        // Тут можна додати відправку email користувачу
        // Mail::to($contact->email)->send(...);
        
        return response()->json(['success' => true, 'message' => 'Відповідь надіслано']);
    }

    // Видалити повідомлення
    public function destroy($id)
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }
        
        $contact = Contact::findOrFail($id);
        $contact->delete();
        
        return response()->json(['success' => true]);
    }

    public function userNotifications()
{
    $user = auth()->user();
    
    if (!$user) {
        return response()->json([]);
    }
    
    // Шукаємо відповіді за email або name поточного користувача
    $replies = Contact::where(function ($query) use ($user) {
            $query->where('email', $user->email)
                  ->orWhere('name', $user->name);
        })
        ->where('status', 'replied')
        ->whereNotNull('admin_reply')
        ->orderBy('replied_at', 'desc')
        ->get()
        ->map(function ($contact) {
            return [
                'id' => $contact->id,
                'type' => 'reply',
                'title' => 'Відповідь на ваше повідомлення',
                'message' => $contact->admin_reply,
                'created_at' => $contact->replied_at ?? $contact->created_at,
            ];
        });
    
    // Отримуємо нові розділи з бібліотеки
    $savedBookIds = \App\Models\SavedBook::where('user_id', $user->id)->pluck('book_id');
    
    $chapters = [];
    if ($savedBookIds->isNotEmpty()) {
        $chapters = \App\Models\Chapter::with('book')
            ->whereIn('book_id', $savedBookIds)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($chapter) {
                return [
                    'id' => $chapter->id,
                    'type' => 'chapter',
                    'title' => 'Новий розділ!',
                    'message' => "У книзі \"{$chapter->book->title}\" вийшов новий розділ {$chapter->chapter_number}: " . ($chapter->title ?? 'Без назви'),
                    'created_at' => $chapter->created_at,
                    'book_title' => $chapter->book->title,
                    'book_slug' => $chapter->book->slug,
                    'book_photo' => $chapter->book->photo ? url($chapter->book->photo) : null,
                    'chapter_number' => $chapter->chapter_number,
                    'chapter_title' => $chapter->title,
                ];
            });
    }
    
    // Об'єднуємо та сортуємо
    $notifications = $replies->concat($chapters)
        ->sortByDesc('created_at')
        ->values();
    
    return response()->json($notifications);
}
}