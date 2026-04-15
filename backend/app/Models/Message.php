<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;


class Message extends Model
{
    //  
    protected $fillable = [
        'conversation_id',
        'sender',
        'content',
    ];  
}
