#!/bin/sh
# Backup de la base MySQL local de GestivaPyme (respaldo, conexion mysql_local).
# Se ejecuta automaticamente en cada commit via .git/hooks/pre-commit.
# Las credenciales se leen de backend/.env (variables DB_LOCAL_*).
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
ROOT="${ROOT:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
ENV_FILE="$ROOT/backend/.env"

# Lee un valor del .env ignorando comentarios y quitando comillas.
get_env() {
  key="$1"
  [ -f "$ENV_FILE" ] || return 1
  sed -n -e '/^[[:space:]]*#/d' -e 's/^[[:space:]]*'"$key"'[[:space:]]*=[[:space:]]*//p' "$ENV_FILE" \
    | tail -n 1 \
    | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

HOST="$(get_env DB_LOCAL_HOST)";     [ -n "$HOST" ] || HOST="${MYSQL_HOST:-127.0.0.1}"
PORT="$(get_env DB_LOCAL_PORT)";     [ -n "$PORT" ] || PORT="${MYSQL_PORT:-3306}"
USER="$(get_env DB_LOCAL_USERNAME)"; [ -n "$USER" ] || USER="${MYSQL_USER:-root}"
PASS="$(get_env DB_LOCAL_PASSWORD)"; [ -n "$PASS" ] || PASS="${MYSQL_PASS:-}"
DB="$(get_env DB_LOCAL_DATABASE)";   [ -n "$DB" ]   || DB="${MYSQL_DB:-gestivapyme}"

MYSQLDUMP="${MYSQLDUMP_PATH:-/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe}"

BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR" || exit 0

OUT="$BACKUP_DIR/gestivapyme_mysql_$(date +%Y%m%d_%H%M%S).sql"
ERR="$BACKUP_DIR/.mysqldump_error.log"

if [ -n "$PASS" ]; then PASSARG="-p$PASS"; else PASSARG=""; fi

if "$MYSQLDUMP" -h "$HOST" -P "$PORT" -u "$USER" $PASSARG \
     --single-transaction --routines --triggers --default-character-set=utf8mb4 \
     "$DB" > "$OUT" 2> "$ERR"; then
  rm -f "$ERR"
  if git rev-parse --git-dir >/dev/null 2>&1; then
    git add -f "$OUT" >/dev/null 2>&1
  fi
  echo "BACKUP MySQL generado y agregado al commit: backups/$(basename "$OUT")"
else
  MSG="$(cat "$ERR" 2>/dev/null)"
  rm -f "$OUT" "$ERR"
  echo "AVISO: no se pudo crear el backup MySQL ($MSG). El commit continua." >&2
fi
exit 0