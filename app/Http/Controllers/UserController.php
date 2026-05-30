<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::findOrFail($id);
    
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'role' => $user->role,
            'created_at' => $user->created_at->format('d.m.Y'),
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Перевірка прав (тільки власник може редагувати)
        if ($request->user()->id != $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'phone' => 'nullable|string|max:20',
            'name' => 'sometimes|string|max:255',
            'avatar' => 'nullable|string', // base64 зображення
        ]);

        $data = $request->only(['phone', 'name']);
        
        // Обробка аватара
        if ($request->has('avatar') && $request->avatar) {
            // Видаляємо старий аватар
            if ($user->avatar && File::exists(public_path($user->avatar))) {
                File::delete(public_path($user->avatar));
            }
            
            $relativePath = $this->saveAvatar($request->avatar);
            $data['avatar'] = $relativePath;
        }
        
        $user->update($data);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'created_at' => $user->created_at->format('d.m.Y'),
        ]);
    }
    
    /**
     * Збереження аватара з base64
     */
    private function saveAvatar($photo)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $photo, $type)) {
            $photo = substr($photo, strpos($photo, ',') + 1);
            $type = strtolower($type[1]);
            
            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                throw new \Exception('invalid image type');
            }
            $photo = str_replace(' ', '+', $photo);
            $photo = base64_decode($photo);
            
            if ($photo === false) {
                throw new \Exception('base64_decode failed');
            }
        } else {
            throw new \Exception('did not match data URI with image data');
        }
        
        $dir = 'avatars/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $photo);
        
        return $relativePath;
    }

    public function getTopAuthors()
    {
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

    public function getAllUsers()
    {
        $user = auth()->user();
        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }
        
        $users = User::select('id', 'name', 'email', 'role')->get();
        return response()->json($users);
    }

    public function updateUserRole(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Доступ заборонено'], 403);
        }
        
        $request->validate([
            'role' => 'required|in:user,moderator,admin'
        ]);
        
        $targetUser = User::findOrFail($id);
        
        // Не можна змінювати роль супер-адміна (якщо він єдиний)
        if ($targetUser->role === 'admin' && $targetUser->id === $user->id) {
            return response()->json(['error' => 'Не можна змінити свою роль'], 422);
        }
        
        $targetUser->update(['role' => $request->role]);
        
        return response()->json(['success' => true]);
    }
}