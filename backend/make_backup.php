<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$pdo = DB::connection('pgsql')->getPdo();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$dir = dirname(__DIR__) . '/backups';
if (!is_dir($dir)) { mkdir($dir, 0777, true); }
$file = $dir . '/supabase_backup_' . date('Ymd_His') . '.sql';
$out = fopen($file, 'w');

function w($out, $s) { fwrite($out, $s . "\n"); }

w($out, "-- GestivaPyme - Backup de Supabase");
w($out, "-- Generado: " . date('Y-m-d H:i:s'));
w($out, "-- Motor destino: PostgreSQL (restaurable en Supabase o local)");
w($out, "");
w($out, "SET statement_timeout = 0;");
w($out, "SET client_encoding = 'UTF8';");
w($out, "");
w($out, "CREATE SCHEMA IF NOT EXISTS public;");
w($out, "");

// 1) Enums
$enums = $pdo->query("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname='public' AND t.typtype='e' ORDER BY t.typname, e.enumsortorder")->fetchAll(PDO::FETCH_ASSOC);
$enumGroups = [];
foreach ($enums as $e) { $enumGroups[$e['typname']][] = $e['enumlabel']; }
foreach ($enumGroups as $name => $labels) {
    $vals = implode(', ', array_map(fn($l) => "'" . str_replace("'", "''", $l) . "'", $labels));
    w($out, "CREATE TYPE public.\"$name\" AS ENUM ($vals);");
}
if ($enumGroups) w($out, "");

// 2) Sequences
$seqs = $pdo->query("SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname='public' AND c.relkind='S' ORDER BY c.relname")->fetchAll(PDO::FETCH_COLUMN);
foreach ($seqs as $s) {
    $val = $pdo->query('SELECT last_value FROM public."' . $s . '"')->fetchColumn();
    $val = is_numeric($val) ? ((int) $val + 1) : 1;
    w($out, "CREATE SEQUENCE IF NOT EXISTS public.\"$s\" START WITH $val INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;");
}
if ($seqs) w($out, "");

// 3) Tables
function pgType($c) {
    $dt = $c['data_type'];
    if ($dt === 'USER-DEFINED') return $c['udt_name'];
    if ($dt === 'numeric' || $dt === 'decimal') {
        $p = $c['numeric_precision']; $s = $c['numeric_scale'];
        if ($p !== null && $s !== null && $s > 0) return "numeric($p,$s)";
        if ($p !== null && $s === 0) return "numeric($p,0)";
        return 'numeric';
    }
    if ($dt === 'character varying') return 'varchar';
    if ($dt === 'character') return 'char';
    $map = [
        'integer' => 'integer', 'bigint' => 'bigint', 'smallint' => 'smallint',
        'boolean' => 'boolean',
        'timestamp without time zone' => 'timestamp',
        'timestamp with time zone' => 'timestamptz',
        'date' => 'date', 'time without time zone' => 'time',
        'text' => 'text', 'json' => 'json', 'jsonb' => 'jsonb',
        'double precision' => 'double precision', 'real' => 'real',
        'uuid' => 'uuid', 'bytea' => 'bytea', 'money' => 'money',
        'array' => $c['udt_name'], 'ARRAY' => $c['udt_name'],
    ];
    return $map[$dt] ?? $c['udt_name'];
}

$tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $t) {
    $stmt = $pdo->prepare("SELECT column_name, data_type, udt_name, is_nullable, column_default, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_schema='public' AND table_name=? ORDER BY ordinal_position");
    $stmt->execute([$t]);
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $defs = [];
    foreach ($cols as $c) {
        $line = '"' . $c['column_name'] . '" ' . pgType($c);
        if ($c['is_nullable'] === 'NO') $line .= ' NOT NULL';
        if ($c['column_default'] !== null) $line .= ' DEFAULT ' . $c['column_default'];
        $defs[] = $line;
    }
    w($out, "CREATE TABLE IF NOT EXISTS public.\"$t\" (");
    w($out, "  " . implode(",\n  ", $defs));
    w($out, ");");
    w($out, "");
}

// 4) Data (constraints se agregan al final, como hace pg_dump)
$rowsByTable = [];
foreach ($tables as $t) {
    $stmt = $pdo->query('SELECT * FROM public."' . $t . '"');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($rows) $rowsByTable[$t] = $rows;
}
foreach ($rowsByTable as $t => $rows) {
    $colNames = array_keys($rows[0]);
    foreach ($rows as $r) {
        $vals = [];
        foreach ($colNames as $cn) {
            $v = $r[$cn];
            if ($v === null) { $vals[] = 'NULL'; continue; }
            if (is_int($v) || is_float($v)) { $vals[] = $v; continue; }
            $v = (string) $v;
            if (preg_match('/^[0-9]+(\.[0-9]+)?$/', $v)) { $vals[] = $v; continue; }
            $vals[] = $pdo->quote($v);
        }
        $cols = '"' . implode('","', $colNames) . '"';
        w($out, "INSERT INTO public.\"$t\" ($cols) VALUES (" . implode(', ', $vals) . ");");
    }
    w($out, "");
}

// 5) Constraints (PK, UNIQUE, CHECK, FK)
$cons = $pdo->query("SELECT conrelid::regclass::text AS tbl, conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND contype IN ('p','u','c','f') ORDER BY conrelid::regclass::text, CASE contype WHEN 'p' THEN 0 WHEN 'u' THEN 1 WHEN 'c' THEN 2 ELSE 3 END")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cons as $c) {
    $tbl = trim($c['tbl'], '"');
    w($out, "ALTER TABLE ONLY public.\"$tbl\" ADD CONSTRAINT \"{$c['conname']}\" {$c['def']};");
}
if ($cons) w($out, "");

// 6) Indexes (no primarios)
$idxs = $pdo->query("SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND indexname NOT IN (SELECT conname FROM pg_constraint WHERE connamespace='public'::regnamespace AND contype='p') ORDER BY indexname")->fetchAll(PDO::FETCH_ASSOC);
foreach ($idxs as $i) {
    if (preg_match('/\bPRIMARY\b/i', $i['indexdef'])) continue;
    w($out, $i['indexdef'] . ';');
}
if ($idxs) w($out, "");

// 7) Triggers
$trgs = $pdo->query("SELECT pg_get_triggerdef(oid) AS def FROM pg_trigger WHERE NOT tgisinternal AND tgrelid::regnamespace = 'public'::regnamespace")->fetchAll(PDO::FETCH_COLUMN);
foreach ($trgs as $d) { w($out, $d . ';'); }
if ($trgs) w($out, "");

fclose($out);

echo "Backup generado: " . realpath($file) . PHP_EOL;
echo "Tablas: " . count($tables) . ", tablas con datos: " . count($rowsByTable) . PHP_EOL;
$sz = filesize($file);
echo "Tamaño: " . round($sz / 1024, 1) . " KB" . PHP_EOL;
