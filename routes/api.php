<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController; 
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\SavedBookController;
use App\Http\Controllers\CommentController; 
use App\Http\Controllers\FriendController;

/* 
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/recipe/get-by-slug/{recipe:slug}', [RecipeController::class, 'getBySlug']);
Route::post('/recipe/increase-views/{id}', [RecipeController::class, 'increaseViews']);

Route::get('/book/get-by-slug/{book:slug}', [BookController::class, 'getBySlug']);
Route::post('/book/increase-rating/{id}', [BookController::class, 'increaseRating']);

Route::get('/latest-chapters', [ChapterController::class, 'latestChapters']);

Route::get('/books/{book}/comments', [CommentController::class, 'index']);

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile/{id}', [UserController::class, 'show']);
    Route::put('/profile/{id}', [UserController::class, 'updateProfile']);
    Route::get('/top-authors', [UserController::class, 'getTopAuthors']);
    
    Route::apiResource('book', BookController::class);

    Route::get('/books/{book}/chapters', [ChapterController::class, 'index']);
    Route::get('/books/{book}/chapters/{chapterNumber}', [ChapterController::class, 'show']);
    Route::post('/books/{book}/chapters', [ChapterController::class, 'store']);
    Route::put('/books/{book}/chapters/{chapterNumber}', [ChapterController::class, 'update']);
    Route::delete('/books/{book}/chapters/{chapterNumber}', [ChapterController::class, 'destroy']);
    Route::get('/library-chapters', [ChapterController::class, 'libraryChapters']);
    
    Route::get('/book/{book}/rating', [RatingController::class, 'getUserRating']);
    Route::post('/book/{book}/rate', [RatingController::class, 'rate']);

    Route::get('/history', [HistoryController::class, 'index']);
    Route::post('/history', [HistoryController::class, 'store']);
    Route::delete('/history', [HistoryController::class, 'destroy']);

    Route::get('/saved-books', [SavedBookController::class, 'index']);
    Route::get('/saved-books/check/{bookId}', [SavedBookController::class, 'check']);
    Route::post('/saved-books', [SavedBookController::class, 'store']);
    Route::delete('/saved-books/{bookId}', [SavedBookController::class, 'destroy']);

    Route::post('/books/{book}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/friends/pending', [FriendController::class, 'pendingRequests']);
    Route::get('/friends/{userId}', [FriendController::class, 'index']);
    Route::post('/friends/request', [FriendController::class, 'sendRequest']);
    Route::post('/friends/accept/{friendId}', [FriendController::class, 'acceptRequest']);
    Route::delete('/friends/{friendId}', [FriendController::class, 'removeFriend']);
    Route::get('/friends/status/{userId}', [FriendController::class, 'checkStatus']);
});