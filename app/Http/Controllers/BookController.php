<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $filter = $request->query('filter');
        $tags = $request->query('tags');
        $ageLimit = $request->query('age_limit');
        $userId = $request->query('user_id');
        
        $query = Book::query();
        
        // Пошук за назвою
        if ($search) {
            $query->where('title', 'like', "%$search%");
        }

        // Фільтрація за тегами
        if ($tags) {
            $tagArray = explode(',', $tags);
            foreach ($tagArray as $tag) {
                $query->where('tags', 'like', "%$tag%");
            }
        }

        // Фільтрація за віковим обмеженням
        if ($ageLimit && $ageLimit !== 'all') {
            $query->where('age_limit', '<=', $ageLimit);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($filter === 'new') {
            $query->orderBy('created_at', 'desc');
        } elseif ($filter === 'popular') {
            $query->orderBy('views', 'desc');
        } elseif ($filter === 'rating') {
            $query->orderByRaw('COALESCE(rating, 0) DESC');
        } else {
            $query->orderBy('created_at', 'desc'); 
        }

        return BookResource::collection(
            $query->paginate(8)->withQueryString()
        );
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookRequest $request)
    {
        $data = $request->validated(); 
        
        if (empty($data['slug'])) {
            $data['slug'] = Book::generateUniqueSlug($data['title']);
        }

        if (isset($data['photo'])) {
            $relativePath = $this->savePhoto($data['photo']);
            $data['photo'] = $relativePath;
        }

        $book = Book::create($data);

        return new BookResource($book);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book, Request $request)
    {
        $user = $request->user();
        if ($user->id !== $book->user_id) {
            return abort(403, 'Unauthorized action');
        }
        $book->incrementViews();
        return new BookResource($book);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookRequest $request, Book $book)
    {
        $data = $request->validated();

        if (isset($data['photo'])) {
            $relativePath = $this->savePhoto($data['photo']);
            $data['photo'] = $relativePath;

            if ($book->photo) {
                $absolutePath = public_path($book->photo);
                File::delete($absolutePath);
            }
        }

        $book->update($data);

        return new BookResource($book);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book, Request $request)
    {
        $user = $request->user();
        if ($user->id !== $book->user_id) {
            return abort(403, 'Unauthorized action.');
        }

        if ($book->photo) {
            $absolutePath = public_path($book->photo);
            if (File::exists($absolutePath)) {
                File::delete($absolutePath);
            }
        }

        $book->delete();

        return response('', 204);
    }

    private function savePhoto($photo)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $photo, $type)) {
            $photo = substr($photo, strpos($photo, ',') + 1);
            $type = strtolower($type[1]);

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
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

        $dir = 'books_photos/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $photo);

        return $relativePath;
    }

    public function getBySlug(Book $book)
    {
        $book->incrementViews();
        return new BookResource($book);
    }

    public function increaseRating($id)
    {
        $book = Book::findOrFail($id);
        $book->rating = min(5.0, $book->rating + 0.5);
        $book->save();

        return response()->json(['success' => true, 'new_rating' => $book->rating]);
    }
}