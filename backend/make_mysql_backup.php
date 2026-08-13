<?php

$srcDir = dirname(__DIR__) . '/backups';
$files = glob($srcDir . '/supabase_backup_*.sql');
if (!$files) { fwrite(STDERR, "No hay backup fuente\n"); exit(1); }
usort($files, fn($a, $b) => filemtime($b) - filemtime($a));
$src = $files[0];

$lines = file($src, FILE_IGNORE_NEW_LINES);
if ($lines === false) { fwrite(STDERR, "No se pudo leer $src\n"); exit(1); }

$outFile = $srcDir . '/gestivapyme_mysql_' . date('Ymd_His') . '.sql';
$out = fopen($outFile, 'w');

function w($s) { global $out; fwrite($out, $s . "\n"); }

// secuencias para AUTO_INCREMENT
$autoIncrements = [];
$currentTable = null;
$hasId = false;
$colLines = [];
$inlinePk = [];
$colTypes = [];
$constraintNames = [];

function splitValues($tuple) {
    $vals = [];
    $cur = '';
    $inStr = false;
    $len = strlen($tuple);
    for ($i = 0; $i < $len; $i++) {
        $ch = $tuple[$i];
        if ($inStr) {
            if ($ch === "'") {
                if ($i + 1 < $len && $tuple[$i + 1] === "'") { $cur .= "''"; $i++; }
                else { $inStr = false; $cur .= "'"; }
            } else { $cur .= $ch; }
        } else {
            if ($ch === "'") { $inStr = true; $cur .= "'"; }
            elseif ($ch === ',') { $vals[] = trim($cur); $cur = ''; }
            else { $cur .= $ch; }
        }
    }
    $vals[] = trim($cur);
    return $vals;
}

$typeMap = [
    'bigint' => 'INT',
    'integer' => 'INT',
    'smallint' => 'SMALLINT',
    'boolean' => 'TINYINT(1)',
    'double precision' => 'DOUBLE',
    'real' => 'FLOAT',
    'numeric' => 'DECIMAL',
    'character varying' => 'VARCHAR(255)',
    'varchar' => 'VARCHAR(255)',
    'character' => 'CHAR(1)',
    'text' => 'TEXT',
    'timestamp' => 'TIMESTAMP',
    'timestamptz' => 'TIMESTAMP',
    'date' => 'DATE',
    'time' => 'TIME',
    'json' => 'JSON',
    'jsonb' => 'JSON',
    'uuid' => 'CHAR(36)',
    'bytea' => 'LONGBLOB',
    'money' => 'DECIMAL(19,4)',
];

function convertType($type) {
    global $typeMap;
    $type = trim($type);
    // array types -> JSON
    if (str_ends_with($type, '[]')) return 'JSON';
    if (preg_match('/^numeric\((\d+),(\d+)\)$/', $type, $m)) return "DECIMAL({$m[1]},{$m[2]})";
    if (isset($typeMap[$type])) return $typeMap[$type];
    return $type;
}

w("-- GestivaPyme - Version MySQL del respaldo (convertido desde Supabase/PostgreSQL)");
w("-- Generado: " . date('Y-m-d H:i:s'));
w("-- Importar con: MySQL Workbench -> Open SQL Script -> Execute  (o: mysql -u root -p < archivo)");
w("");
w("CREATE DATABASE IF NOT EXISTS gestivapyme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
w("USE gestivapyme;");
w("SET NAMES utf8mb4;");
w("SET FOREIGN_KEY_CHECKS=0;");
w("SET UNIQUE_CHECKS=0;");
w("");

foreach ($lines as $line) {
    $l = trim($line);

    // --- saltar SET statements de PG y CREATE SCHEMA / SEQUENCE
    if (str_starts_with($l, 'SET ')) continue;
    if (str_starts_with($l, 'CREATE SCHEMA')) continue;
    if (str_starts_with($l, 'CREATE SEQUENCE')) {
        if (preg_match('/"([a-z_]+)_id_seq" START WITH (\d+)/i', $l, $m)) {
            $autoIncrements[$m[1]] = (int) $m[2];
        }
        continue;
    }

    // --- CREATE TABLE
    if (preg_match('/^CREATE TABLE IF NOT EXISTS public\."([^"]+)" \($/', $l, $m)) {
        $currentTable = $m[1];
        $hasId = false;
        $colLines = [];
        w("CREATE TABLE IF NOT EXISTS `{$m[1]}` (");
        continue;
    }
    if ($l === ');' || $l === ')') {
        if ($currentTable !== null) {
            if ($hasId) {
                $colLines[] = "PRIMARY KEY (`id`)";
                $inlinePk[$currentTable] = true;
            }
            w("  " . implode(",\n  ", $colLines));
        }
        $currentTable = null;
        $hasId = false;
        w(");");
        w("");
        continue;
    }
    // lineas de columna (empiezan con comilla + nombre)
    if (preg_match('/^"([^"]+)" (.*?)(,?)$/', $l, $m)) {
        $col = $m[1];
        $rest = $m[2];
        $trail = $m[3];

        $isAuto = false;
        if (preg_match('/DEFAULT nextval\(\'[^\']+\'::regclass\)/', $rest)) {
            $rest = preg_replace('/ DEFAULT nextval\(\'[^\']+\'::regclass\)/', '', $rest);
            $isAuto = true;
        }
        // quitar casts ::xxx
        $rest = preg_replace('/::[a-z_][a-z_ ]*/', '', $rest);
        // mapear tipo
        if (preg_match('/^([a-z][a-z0-9 \(\)]+?)(\s+(NOT NULL|DEFAULT|NULL).*)?$/i', $rest, $tm)) {
            $typeRaw = trim($tm[1]);
            $convertedType = convertType($typeRaw);
            $rest = $convertedType . ($tm[2] ?? '');
            $colTypes[$currentTable][$col] = $convertedType;
        }
        // boolean defaults
        $rest = str_replace('DEFAULT true', 'DEFAULT 1', $rest);
        $rest = str_replace('DEFAULT false', 'DEFAULT 0', $rest);
        // JSON no soporta DEFAULT literal en MySQL
        if (preg_match('/^JSON/', trim($rest)) && preg_match('/DEFAULT/', $rest)) {
            $rest = preg_replace('/ DEFAULT [^,]*/', '', $rest);
        }
        if ($isAuto) $rest .= ' AUTO_INCREMENT';
        if ($col === 'id') $hasId = true;
        $colLines[] = "`$col` " . trim($rest);
        continue;
    }

    // --- INSERT INTO
    if (preg_match('/^INSERT INTO public\."([^"]+)" \(/', $l, $m)) {
        $body = substr($l, strlen($m[0]));
        if (preg_match('/^(.*)\)\s*VALUES \((.*)\);\s*$/', $body, $vm)) {
            $cols = preg_replace('/"([^"]+)"/', '`$1`', trim($vm[1]));
            $colNames = array_map('trim', explode(',', trim($vm[1])));
            $colNames = array_map(fn($c) => trim($c, '"'), $colNames);
            $values = splitValues($vm[2]);
            foreach ($values as $i => $v) {
                $colName = $colNames[$i] ?? '';
                $ctype = $colTypes[$m[1]][$colName] ?? '';
                if ($v === "''" && preg_match('/^(INT|BIGINT|SMALLINT|TINYINT|DECIMAL|DOUBLE|FLOAT)/', $ctype)) {
                    $values[$i] = '0';
                }
            }
            $l = "INSERT INTO `{$m[1]}` ($cols) VALUES (" . implode(', ', $values) . ");";
            w($l);
            continue;
        }
    }

    // --- ALTER TABLE constraints
    if (preg_match('/^ALTER TABLE ONLY public\."([^"]+)" ADD CONSTRAINT "([^"]+)" (.*);$/', $l, $m)) {
        $tbl = $m[1];
        $cname = $m[2];
        $def = $m[3];
        if (preg_match('/^CHECK/', $def)) {
            w("-- (omitido) CHECK `$cname` en `$tbl`");
            continue;
        }
        if (str_starts_with($def, 'PRIMARY KEY') && isset($inlinePk[$tbl])) {
            w("-- (omitido) PK inline en `$tbl`");
            continue;
        }
        // backticks en columnas y REFERENCES
        $def = preg_replace('/REFERENCES ([a-z_0-9]+)\(/', 'REFERENCES `$1`(', $def);
        $def = preg_replace_callback('/\(([^()]*)\)/', function ($mm) {
            $parts = array_map('trim', explode(',', $mm[1]));
            return '(' . implode(', ', array_map(fn($p) => '`' . trim($p, '`') . '`', $parts)) . ')';
        }, $def);
        w("ALTER TABLE `$tbl` ADD CONSTRAINT `$cname` $def;");
        $constraintNames[] = $cname;
        continue;
    }

    // --- CREATE INDEX
    if (preg_match('/^CREATE (UNIQUE )?INDEX ([a-z_0-9]+) ON public\.("?)([a-z_0-9]+)\3 USING btree \((.*)\);$/', $l, $m)) {
        $uniq = trim($m[1]);
        if ($uniq !== '' && in_array($m[2], $constraintNames)) {
            w("-- (omitido) UNIQUE INDEX `{$m[2]}` ya creado como constraint");
            continue;
        }
        $cols = preg_replace_callback('/\(([^()]*)\)/', function ($mm) {
            $parts = array_map('trim', explode(',', $mm[1]));
            return '(' . implode(', ', array_map(fn($p) => '`' . trim($p, '`') . '`', $parts)) . ')';
        }, "($m[5])");
        w("CREATE $uniq INDEX `{$m[2]}` ON `{$m[4]}` $cols;");
        continue;
    }

    // --- otras lineas
    if ($l !== '' && !str_starts_with($l, '--') && !preg_match('/^(\)|\);)$/', $l)) {
        // conservar tal cual si no se reconoce pero no es basura de PG
        w($l);
    }
}

// --- AUTO_INCREMENT
w("");
w("-- Valores de AUTO_INCREMENT (continuan la numeracion actual)");
foreach ($autoIncrements as $tbl => $val) {
    w("ALTER TABLE `$tbl` AUTO_INCREMENT = $val;");
}
w("");
w("SET FOREIGN_KEY_CHECKS=1;");
w("SET UNIQUE_CHECKS=1;");
w("");
w("-- Importacion completada");

fclose($out);
echo "Archivo MySQL generado: " . realpath($outFile) . PHP_EOL;
echo "Fuente: " . basename($src) . PHP_EOL;