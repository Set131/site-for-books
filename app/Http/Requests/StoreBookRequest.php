<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'user_id' => $this->user()->id
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'photo' => 'nullable|string',
            'user_id' => 'exists:users,id',
            'description' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:10',
            'age_limit' => 'nullable|integer|min:0|max:18',
            'tags' => 'nullable|string|max:500',
        ];
    }
}