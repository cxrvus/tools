#!/usr/bin/env bash
set -euo pipefail

usage() {
	echo "Usage: $0 REPLACEMENTS_FILE [ROOT]" >&2
	exit 2
}

[[ $# -ge 1 && $# -le 2 ]] || usage

replacements_file=$1
root=${2:-.}

[[ -f $replacements_file ]] || {
	echo "replacements file not found: $replacements_file" >&2
	exit 1
}

mapfile -t replacements < <(
	awk '
		/^[[:space:]]*($|#)/ { next }
		{ print }
	' "$replacements_file"
)

((${#replacements[@]})) || {
	echo "no replacements found in: $replacements_file" >&2
	exit 1
}

total=$(find "$root" \( -path "$root/.git" -o -type d -name tmp \) -prune -o -type f ! -samefile "$replacements_file" -print | wc -l)
processed=0

while IFS= read -r -d '' file; do
	((processed += 1))
	printf '\r[%d/%d] %s\033[KLL' "$processed" "$total" "$file" >&2
	grep -Iq '' "$file" || continue

	for replacement in "${replacements[@]}"; do
		perl -0pi -e "$replacement" "$file"
	done
done < <(
	find "$root" \( -path "$root/.git" -o -type d -name tmp \) -prune -o -type f ! -samefile "$replacements_file" -print0
)
printf '\n' >&2