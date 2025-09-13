#!/bin/bash

echo "🚀 AISEE Manual - Spouštění dokumentace..."
echo ""

# Detekce operačního systému
OS="$(uname -s)"

# Funkce pro otevření URL v prohlížeči
open_browser() {
    case "$OS" in
        Darwin*)  open "$1" ;;
        Linux*)   xdg-open "$1" ;;
        CYGWIN*|MINGW*|MSYS*) start "$1" ;;
        *)        echo "⚠️  Otevřete ručně: $1" ;;
    esac
}

# Zkusit Python 3
if command -v python3 &> /dev/null; then
    echo "✅ Nalezen Python 3"
    echo "📦 Spouštím HTTP server na portu 8000..."
    echo ""
    echo "🌐 Dokumentace bude dostupná na: http://localhost:8000"
    echo "📌 Pro ukončení serveru stiskněte Ctrl+C"
    echo ""
    sleep 2
    open_browser "http://localhost:8000"
    python3 -m http.server 8000

# Zkusit Python 2
elif command -v python &> /dev/null; then
    echo "✅ Nalezen Python 2"
    echo "📦 Spouštím HTTP server na portu 8000..."
    echo ""
    echo "🌐 Dokumentace bude dostupná na: http://localhost:8000"
    echo "📌 Pro ukončení serveru stiskněte Ctrl+C"
    echo ""
    sleep 2
    open_browser "http://localhost:8000"
    python -m SimpleHTTPServer 8000

# Zkusit Node.js pokud existuje
elif command -v node &> /dev/null; then
    echo "✅ Nalezen Node.js"

    # Instalovat závislosti pokud neexistují
    if [ ! -d "node_modules" ]; then
        echo "📦 Instaluji závislosti..."
        npm install
    fi

    echo "🚀 Spouštím live-server..."
    echo ""
    npm run dev

# Fallback - otevřít přímo soubor
else
    echo "⚠️  Python ani Node.js nenalezeny"
    echo "📂 Otevírám index.html přímo v prohlížeči..."

    # Získat absolutní cestu
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    FILE_PATH="file://$SCRIPT_DIR/index.html"

    open_browser "$FILE_PATH"

    echo ""
    echo "✅ Dokumentace otevřena v prohlížeči"
    echo "⚠️  Některé funkce nemusí fungovat správně bez HTTP serveru"
fi