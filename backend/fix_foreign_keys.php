<?php
$files = glob(__DIR__ . '/database/migrations/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    // Fix the broken foreign keys
    $content = preg_replace('/->foreign\(\[\'(.*?)\'\][^\)]*\)/', '->foreign([\'$1\'])', $content);
    file_put_contents($file, $content);
}
echo "Done";
