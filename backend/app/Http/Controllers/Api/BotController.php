<?php namespace App\Http\Controllers\Api;
 use App\Http\Controllers\Controller;
  use Illuminate\Http\Request;
  
  class BotController extends Controller { 
    public function webhook(Request $request)
    { return response()->json([ 'ok' => true, 'test' => 'working' ]); } }