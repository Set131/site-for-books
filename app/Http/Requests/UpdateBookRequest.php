<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $book = $this->route('book');

        if ($this->user()->id !== $book->user_id) {
            return false;
        }
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'photo' => 'nullable|string',
            'user_id' => 'exists:users,id',
            'description' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'age_limit' => 'nullable|integer|min:0|max:18',
            'tags' => 'nullable|string|max:500',
            'slug' => 'nullable|string|unique:books,slug,' . $this->route('book')->id,
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Якщо потрібно автоматично додати user_id (хоча він вже є з роута)
        if (!$this->has('user_id')) {
            $this->merge([
                'user_id' => $this->user()->id
            ]);
        }
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title.required' => 'Назва книги обов\'язкова',
            'title.max' => 'Назва не може бути довшою за 255 символів',
            'rating.min' => 'Рейтинг не може бути меншим за 0',
            'rating.max' => 'Рейтинг не може бути більшим за 5',
            'age_limit.min' => 'Вікове обмеження не може бути меншим за 0',
            'age_limit.max' => 'Вікове обмеження не може бути більшим за 18',
            'tags.max' => 'Теги не можуть бути довшими за 500 символів',
            'slug.unique' => 'Такий slug вже існує',
        ];
    }
}