#!/bin/bash
# Baut aus page.html und js/*.js:
#   ../Vimsical.app              macOS-App (öffnet ein eigenes Fenster)
#   ../Vimsical (Windows).cmd    Windows-Starter in einer Datei
#   ../Vimsical (Browser).html   eine einzelne Datei für jeden Browser
#   build/artifact.html          Seite für das claude.ai-Artifact
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(cd "$SRC/.." && pwd)"
B="$SRC/build"
[ -f "$B/fonts.css" ] || "$B/fonts.sh"

# 1. Seite ohne externe Schriften, mit eingebetteten Schriften und Skripten
perl -0e '
  my ($page, $fonts, $dir) = @ARGV;
  local $/; open F, "<", $page or die; my $h = <F>; close F;
  open F, "<", $fonts or die; my $f = <F>; close F;
  $h =~ s{<link rel="preconnect"[^>]*>\n}{}g;
  $h =~ s{<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n}{<style>\n$f</style>\n};
  $h =~ s{<script src="(js/[^"]+)"></script>}{ open J, "<", "$dir/$1" or die "$1"; my $j = <J>; close J; "<script>\n$j</script>" }ge;
  print $h;
' "$SRC/page.html" "$B/fonts.css" "$SRC" > "$B/artifact.html"

# 2. Vollständiges HTML-Dokument
{
  printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  perl -0ne 'print $1 if /^(.*?<\/style>\n(?:<style>.*?<\/style>\n)?)/s' "$B/artifact.html"
  printf '</head>\n<body>\n'
  perl -0ne 'print $1 if /^.*?<\/style>\n(?:<style>.*?<\/style>\n)?(.*)$/s' "$B/artifact.html"
  printf '</body>\n</html>\n'
} > "$B/app.html"
cp "$B/app.html" "$OUT/Vimsical (Browser).html"

# 3. App-Symbol
if [ ! -f "$B/AppIcon.icns" ]; then
  CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "$CH" --headless=new --disable-gpu --no-first-run --user-data-dir="$B/.chrome" --default-background-color=00000000 \
    --window-size=1024,1024 --screenshot="$B/icon.png" "file://$B/icon.html" >/dev/null 2>&1
  rm -rf "$B/.chrome" "$B/AppIcon.iconset"; mkdir "$B/AppIcon.iconset"
  for s in 16 32 128 256 512; do
    sips -z $s $s "$B/icon.png" --out "$B/AppIcon.iconset/icon_${s}x${s}.png" >/dev/null
    sips -z $((s*2)) $((s*2)) "$B/icon.png" --out "$B/AppIcon.iconset/icon_${s}x${s}@2x.png" >/dev/null
  done
  iconutil -c icns "$B/AppIcon.iconset" -o "$B/AppIcon.icns"
  rm -rf "$B/AppIcon.iconset"
fi

# 4. macOS-App
APP="$OUT/Vimsical.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$B/app.html" "$APP/Contents/Resources/vimsical.html"
cp "$B/AppIcon.icns" "$APP/Contents/Resources/AppIcon.icns"
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Vimsical</string>
  <key>CFBundleDisplayName</key><string>Vimsical</string>
  <key>CFBundleIdentifier</key><string>de.vimsical.app</string>
  <key>CFBundleVersion</key><string>3.0</string>
  <key>CFBundleShortVersionString</key><string>3.0</string>
  <key>CFBundleExecutable</key><string>Vimsical</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
</dict>
</plist>
PLIST
cat > "$APP/Contents/MacOS/Vimsical" <<'LAUNCH'
#!/bin/bash
# Startet Vimsical in einem eigenen Browserfenster ohne Adressleiste.
# Der Fortschritt liegt im eigenen Browserprofil unter ~/Library/Application Support/Vimsical.
RES="$(cd "$(dirname "$0")/../Resources" && pwd)"
DATA="$HOME/Library/Application Support/Vimsical"
OLD="$HOME/Library/Application Support/VimKurs"
if [ -d "$OLD" ] && [ ! -d "$DATA" ]; then DATA="$OLD"; fi
mkdir -p "$DATA"
cp -f "$RES/vimsical.html" "$DATA/vimsical.html"
URL="file://$(printf '%s' "$DATA/vimsical.html" | sed 's/ /%20/g')"
for B in "Google Chrome" "Microsoft Edge" "Brave Browser" "Chromium" "Vivaldi"; do
  if open -Ra "$B" 2>/dev/null; then
    exec open -na "$B" --args --app="$URL" --user-data-dir="$DATA/Browser" --window-size=1320,880 --no-first-run --no-default-browser-check
  fi
done
exec open "$URL"
LAUNCH
chmod +x "$APP/Contents/MacOS/Vimsical"
touch "$APP"

# 5. Windows-Starter: Batch, PowerShell und HTML in einer Datei
{
  cat <<'CMD'
@echo off
set "VK_SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t=[IO.File]::ReadAllText($env:VK_SELF,[Text.Encoding]::UTF8); iex (($t -split ('#VK'+'PS'))[1])"
exit /b
#VKPS
$t = [IO.File]::ReadAllText($env:VK_SELF, [Text.Encoding]::UTF8)
$m = '<!--VIMSICAL' + '-HTML-->'
$i = $t.IndexOf($m)
$d = Join-Path $env:LOCALAPPDATA 'Vimsical'
$old = Join-Path $env:LOCALAPPDATA 'VimKurs'
if ((Test-Path $old) -and -not (Test-Path $d)) { $d = $old }
New-Item -ItemType Directory -Force -Path $d | Out-Null
$f = Join-Path $d 'vimsical.html'
[IO.File]::WriteAllText($f, $t.Substring($i + $m.Length), (New-Object Text.UTF8Encoding $false))
$u = ([Uri]$f).AbsoluteUri
$cands = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
)
$b = $cands | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($b) {
  Start-Process -FilePath $b -ArgumentList @("--app=$u", "--user-data-dir=`"$d\Browser`"", '--window-size=1320,880', '--no-first-run', '--no-default-browser-check')
} else {
  Start-Process $f
}
#VKPS
CMD
  printf '<!--VIMSICAL-HTML-->'
  cat "$B/app.html"
} | perl -pe 's/\r?\n/\r\n/' > "$OUT/Vimsical (Windows).cmd"

echo "Gebaut: $(du -sh "$APP" | cut -f1) App, $(wc -c < "$OUT/Vimsical (Browser).html" | tr -d ' ') Bytes HTML"
