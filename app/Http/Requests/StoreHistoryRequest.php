<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHistoryRequest extends FormRequest
{
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

    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
            'chapter_id' => 'required|exists:chapters,id',
        ];
    }
    
    public function messages()
    {
        return [
            'book_id.required' => 'ID книги обов\'язковий',
            'chapter_id.required' => 'ID розділу обов\'язковий',
        ];
    }
}