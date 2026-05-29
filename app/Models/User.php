<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'created_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the avatar URL attribute.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return url($this->avatar);
        }
        return null;
    }

    public function books()
    {
        return $this->hasMany(Book::class, 'user_id');
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'friends', 'user_id', 'friend_id')
            ->wherePivot('status', 'accepted');
    }

    // Запити в друзі (очікують підтвердження)
    public function pendingFriendRequests()
    {
        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id')
            ->wherePivot('status', 'pending');
    }

    // Відправлені запити
    public function sentFriendRequests()
    {
        return $this->belongsToMany(User::class, 'friends', 'user_id', 'friend_id')
            ->wherePivot('status', 'pending');
    }

    // Перевірка чи є користувач другом
    public function isFriendWith($userId)
    {
        return $this->friends()->where('friend_id', $userId)->exists();
    }

    // Перевірка чи є запит в друзі
    public function hasPendingRequestFrom($userId)
    {
        return $this->pendingFriendRequests()->where('user_id', $userId)->exists();
    }
}