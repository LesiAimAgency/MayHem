<?php
require __DIR__ . '/vendor/autoload.php';

// 1. Login to get token
$loginUrl = 'http://127.0.0.1:8000/api/v1/auth/login';
$ch = curl_init($loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@mayhem.vn', 'password' => 'admin123']));
$loginResp = curl_exec($ch);
$loginJson = json_decode($loginResp, true);
curl_close($ch);

$token = $loginJson['token'] ?? null;
echo "Token obtained: " . ($token ? substr($token, 0, 15) . '...' : 'NONE') . "\n";

if (!$token) {
    exit("Login failed: $loginResp\n");
}

// 2. Call DELETE /api/v1/screener/filters/1
$deleteUrl = 'http://127.0.0.1:8000/api/v1/screener/filters/1';
$ch = curl_init($deleteUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
$delResp = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Delete HTTP Code: $httpCode\n";
echo "Delete Response: $delResp\n";
