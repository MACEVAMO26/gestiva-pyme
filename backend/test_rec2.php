<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
try {
    $user = App\Models\User::first();
    $token = $user->createToken('test')->plainTextToken;
    echo "Token: " . $token . "\n";

    $ch = curl_init('https://gestiva-pyme.onrender.com/api/recordatorios');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "HTTP Status: " . $httpcode . "\n";
    echo "Response: " . $response . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
