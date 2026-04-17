<?php

namespace App\Models;  

use MongoDB\Laravel\Eloquent\Model;


class Session extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'sessions';

    protected $fillable = [
        'contact_id',
        'flow_id',
        'current_step',
        'data',
        'status',
        'updated_at'
    ];

    protected $casts = [
        'data' => 'array'
    ];
}
