<?php
$files = glob(__DIR__ . '/database/migrations/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    // Remove explicit names from index('name')
    $content = preg_replace('/->index\([\'"][^\'"]+[\'"]\)/', '->index()', $content);
    // Remove explicit names from unique('name')
    $content = preg_replace('/->unique\([\'"][^\'"]+[\'"]\)/', '->unique()', $content);
    // Remove explicit names from foreign keys: foreign(['col'], 'name') -> foreign(['col'])
    $content = preg_replace('/->foreign\((\[.*?\]|\'.*?\'|".*?"),\s*[\'"][^\'"]+[\'"]\)/', '->foreign($1)', $content);
    file_put_contents($file, $content);
}
echo "Done";
