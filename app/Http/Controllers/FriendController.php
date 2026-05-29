<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    public function index($userId)
    {
        $friendIds = DB::table('friends')
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($record) use ($userId) {
                return $record->user_id == $userId ? $record->friend_id : $record->user_id;
            });
        
        $friends = User::whereIn('id', $friendIds)->get()->map(function ($friend) {
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'avatar_url' => $friend->avatar_url,
            ];
        });
        
        return response()->json($friends);
    }
    
    // Відправити запит в друзі
    public function sendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);
        
        $userId = auth()->id();
        $friendId = $request->friend_id;
        
        if ($userId == $friendId) {
            return response()->json(['error' => 'Не можна додати самого себе'], 422);
        }
        
        // Перевіряємо чи вже є запит
        $existing = DB::table('friends')
            ->where(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $userId)->where('friend_id', $friendId);
            })->orWhere(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $friendId)->where('friend_id', $userId);
            })->first();
        
        if ($existing) {
            return response()->json(['error' => 'Запит вже існує або ви вже друзі'], 422);
        }
        
        DB::table('friends')->insert([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        return response()->json(['success' => true, 'message' => 'Запит відправлено']);
    }
    
    // Прийняти запит в друзі
    public function acceptRequest($friendId)
    {
        $userId = auth()->id();
        
        $updated = DB::table('friends')
            ->where('user_id', $friendId)
            ->where('friend_id', $userId)
            ->where('status', 'pending')
            ->update(['status' => 'accepted']);
        
        if ($updated) {
            return response()->json(['success' => true, 'message' => 'Друга додано']);
        }
        
        return response()->json(['error' => 'Запит не знайдено'], 404);
    }
    
    // Відхилити/видалити друга
    public function removeFriend($friendId)
    {
        $userId = auth()->id();
        
        $deleted = DB::table('friends')
            ->where(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $userId)->where('friend_id', $friendId);
            })->orWhere(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $friendId)->where('friend_id', $userId);
            })->delete();
        
        if ($deleted) {
            return response()->json(['success' => true, 'message' => 'Друга видалено']);
        }
        
        return response()->json(['error' => 'Друга не знайдено'], 404);
    }
    
    // Перевірка статусу дружби
    public function checkStatus($userId)
    {
        $currentUserId = auth()->id();
        
        if ($currentUserId == $userId) {
            return response()->json(['status' => 'self']);
        }
        
        $isFriend = DB::table('friends')
            ->where(function ($q) use ($currentUserId, $userId) {
                $q->where('user_id', $currentUserId)->where('friend_id', $userId);
            })->orWhere(function ($q) use ($currentUserId, $userId) {
                $q->where('user_id', $userId)->where('friend_id', $currentUserId);
            })->first();
        
        if (!$isFriend) {
            return response()->json(['status' => 'none']);
        }
        
        if ($isFriend->status == 'pending') {
            if ($isFriend->user_id == $currentUserId) {
                return response()->json(['status' => 'sent']);
            } else {
                return response()->json(['status' => 'received']);
            }
        }
        
        return response()->json(['status' => 'friend']);
    }

    public function pendingRequests()
    {
        $pendingRequests = auth()->user()->pendingFriendRequests()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar_url' => $user->avatar_url,
            ];
        });
        
        return response()->json($pendingRequests);
    }
}