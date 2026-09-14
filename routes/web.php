<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;



Route::get('/login', function (Request $request) {
    return view('auth.login');
})->name('login');

Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

Route::get('/', function (Request $request) {
    $token = $request->cookie('mayhem_token');
    if ($token && (Cache::has("mayhem_token_{$token}") || str_starts_with($token, 'mayhem_demo_') || str_starts_with($token, 'mayhem_local_'))) {
        return view('dashboard');
    }
    
    // Auto router default is login
    return redirect('/login');
});

Route::get('/logout', function () {
    return redirect('/login')->withCookie(cookie()->forget('mayhem_token'));
})->name('logout');
