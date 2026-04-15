<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;



class Flow extends Model
{   protected $connection = 'mongodb';

    protected $fillable = [
        'flow_id',
        'name',
        'keyword',
        'active'
    ];
}
 