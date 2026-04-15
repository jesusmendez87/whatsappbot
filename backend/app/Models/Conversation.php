<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;



class Conversation extends Model
{
        protected $fillable = [
            'contact_id',
            'last_message_id',
        ];
    //
}
