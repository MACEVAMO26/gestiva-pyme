<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Cloudinary URL: " . env('CLOUDINARY_URL') . "\n";
    $result = cloudinary()->uploadApi()->upload('public/favicon.ico', ['folder' => 'test']);
    echo "Upload Success! URL: " . $result['secure_url'] . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
