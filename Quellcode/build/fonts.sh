#!/bin/bash
# Lädt die latin-Teilmengen aller Schriften und erzeugt fonts.css mit eingebetteten data:-URIs.
set -e
cd "$(dirname "$0")"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
URL=$(grep -o 'https://fonts.googleapis.com/css2[^"]*' ../page.html | head -1)
curl -s -A "$UA" "$URL" > raw.css
perl -0ne 'while (/\/\* latin \*\/\s*(\@font-face \{.*?\})/sg) { print "$1\n"; }' raw.css > latin.css
: > fonts.css
while IFS= read -r line; do
  if [[ "$line" =~ url\((https://[^\)]+)\) ]]; then
    u="${BASH_REMATCH[1]}"
    b64=$(curl -s "$u" | base64 | tr -d '\n')
    line="${line/$u/data:font/woff2;base64,$b64}"
  fi
  printf '%s\n' "$line" >> fonts.css
done < latin.css
rm raw.css latin.css
echo "fonts.css: $(wc -c < fonts.css) bytes, $(grep -c '@font-face' fonts.css) faces"
