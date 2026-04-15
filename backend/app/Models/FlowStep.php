<?php

namespace App\Models;
use MongoDB\Laravel\Eloquent\Model; 

class FlowStep extends Model
{
    protected $connection = 'mongodb';

    protected $fillable = [
        'flow_id',
        'step',
        'type',
        'content',
        'save_as'
    ];
}