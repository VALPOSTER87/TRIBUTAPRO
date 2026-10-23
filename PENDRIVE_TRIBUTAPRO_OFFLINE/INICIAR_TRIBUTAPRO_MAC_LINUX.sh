#!/usr/bin/env bash
echo "====================================================================="
echo "          TRIBUTAPRO AGT - VERSAO OFFLINE PORTATIL"
echo "====================================================================="
echo "Iniciando servidor local offline na porta 8080..."
echo ""
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if command -v python3 &>/dev/null; then
    (sleep 2 && (open http://localhost:8080 || xdg-open http://localhost:8080) &)
    python3 -m http.server 8080
elif command -v python &>/dev/null; then
    (sleep 2 && (open http://localhost:8080 || xdg-open http://localhost:8080) &)
    python -m http.server 8080
elif command -v npx &>/dev/null; then
    (sleep 2 && (open http://localhost:8080 || xdg-open http://localhost:8080) &)
    npx serve -l 8080 .
else
    echo "Abrindo arquivo diretamente no navegador..."
    open index.html || xdg-open index.html
fi
