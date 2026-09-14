<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';

    protected $fillable = [
        'log_id',
        'user_role',
        'bank',
        'field',
        'year',
        'old_value',
        'new_value',
        'action',
        'note'
    ];
}
