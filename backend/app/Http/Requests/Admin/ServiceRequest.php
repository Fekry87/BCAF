<?php

namespace App\Http\Requests\Admin;

use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'pillar_id' => ['required', 'exists:pillars,id'],
            'type' => ['required', Rule::in([Service::TYPE_ONE_OFF, Service::TYPE_SUBSCRIPTION])],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('services')->ignore($serviceId),
            ],
            'summary' => ['required', 'string', 'max:500'],
            'details' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:100'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'price_label' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and hyphens.',
        ];
    }
}
