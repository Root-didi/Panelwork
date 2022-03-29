<?php

namespace Pterodactyl\Transformers\Api\Client;

use Illuminate\Support\Str;
use Pterodactyl\Models\User;
use Pterodactyl\Models\AuditLog;
use Pterodactyl\Transformers\Api\Client\UserTransformer;

class AuditLogTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return AuditLog::RESOURCE_NAME;
    }

    /**
     * Transforms a AuditLog model into a representation that can be shown to regular
     * users of the API.
     *
     * @return array
     */
    public function transform(AuditLog $model)
    {
        return [
            'uuid' => $model->uuid,
            'user' => $model->user ? $model->user->email : "System",
            'username' => $model->user ? $model->user->username : "System",
            'action' => $model->action,
            'device' => $model->device,
            'metadata' => $model->metadata,
            'is_system' => $model->is_system,
            'created_at' => $model->created_at->toIso8601String(),
        ];
    }
}
