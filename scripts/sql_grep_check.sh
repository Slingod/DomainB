# /home/slingo/Ends/my-shop/scripts/sql_grep_check.sh
#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

INCLUDES=(--include=*.js --include=*.jsx --include=*.ts --include=*.tsx)
EXCLUDES=(--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --exclude-dir=.git --exclude=*.sqlite --exclude=*.db)

if command -v rg >/dev/null 2>&1; then
  echo "▶ Using ripgrep (rg)"
  rg_base=(rg -n --no-messages --follow "${INCLUDES[@]}" -g "!node_modules" -g "!dist" -g "!build" -g "!.git" -g "!*.sqlite" -g "!*.db")

  echo "— Interpolations dans SQL (template \${} dans .prepare/.exec) —"
  "${rg_base[@]}" '\.prepare\(' "$ROOT" | rg -n --no-messages '\$\{' || true
  "${rg_base[@]}" '\.exec\('    "$ROOT" | rg -n --no-messages '\$\{' || true
  echo

  echo "— Concaténations de chaînes dans SQL (… + var …) —"
  "${rg_base[@]}" '\.prepare\(' "$ROOT" | rg -n --no-messages '\+' || true
  "${rg_base[@]}" '\.exec\('    "$ROOT" | rg -n --no-messages '\+' || true
  echo

  echo "— Clauses potentiellement sensibles —"
  "${rg_base[@]}" -e 'ORDER BY' -e 'WHERE 1=1' -e 'LIKE[[:space:]]*%' "$ROOT" || true
  echo

  echo "— Présence de placeholders (?) —"
  "${rg_base[@]}" '\.prepare\([[:space:]]*["'\''`][^"'\''`]*\?[^\)]*\)' "$ROOT" || true
else
  echo "▶ Using grep"
  GREP_BASE=(grep -RniI "${INCLUDES[@]}" "${EXCLUDES[@]}")

  echo "— Interpolations dans SQL (template \${} dans .prepare/.exec) —"
  "${GREP_BASE[@]}" -F '.prepare(' "$ROOT" | grep -n '\${' || true
  "${GREP_BASE[@]}" -F '.exec('    "$ROOT" | grep -n '\${' || true
  echo

  echo "— Concaténations de chaînes dans SQL (… + var …) —"
  "${GREP_BASE[@]}" -F '.prepare(' "$ROOT" | grep -n '\+' || true
  "${GREP_BASE[@]}" -F '.exec('    "$ROOT" | grep -n '\+' || true
  echo

  echo "— Clauses potentiellement sensibles —"
  "${GREP_BASE[@]}" -E 'ORDER BY|WHERE 1=1|LIKE[[:space:]]*%' "$ROOT" || true
  echo

  echo "— Présence de placeholders (?) —"
  "${GREP_BASE[@]}" -E '\.prepare\([[:space:]]*["'"'"'`][^"'"'"'`]*\?[^\)]*\)' "$ROOT" || true
fi
