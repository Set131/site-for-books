<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'photo_url' => $this->photo ? URL::to($this->photo) : null,
            'description' => $this->description,
            'rating' => $this->rating,
            'age_limit' => $this->age_limit,
            'tags' => $this->tags,
            'views' => $this->views,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'creator_name' => $this->user ? $this->user->name : null,
            'creator_phone' => $this->user ? $this->user->phone : null,
        ];
    }
}