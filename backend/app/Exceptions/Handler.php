<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e);
            }
        });
    }

    protected function handleApiException(Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'meta' => null,
            ], 422);
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Resource not found',
                'errors' => null,
                'meta' => null,
            ], 404);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Unauthenticated',
                'errors' => null,
                'meta' => null,
            ], 401);
        }

        if ($e instanceof HttpException) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage() ?: 'An error occurred',
                'errors' => null,
                'meta' => null,
            ], $e->getStatusCode());
        }

        $statusCode = 500;
        $message = config('app.debug') ? $e->getMessage() : 'An unexpected error occurred';

        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $message,
            'errors' => config('app.debug') ? [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(10)->toArray(),
            ] : null,
            'meta' => null,
        ], $statusCode);
    }
}
