@echo off
echo ======================================
echo   AISEE Manual - Spousteni dokumentace
echo ======================================
echo.

REM Zkusit Python 3
python --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Nalezen Python
    echo [*] Spoustim HTTP server na portu 8000...
    echo.
    echo [!] Dokumentace bude dostupna na: http://localhost:8000
    echo [!] Pro ukonceni serveru stisknete Ctrl+C
    echo.
    timeout /t 2 >nul
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

REM Zkusit Node.js
node --version >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Nalezen Node.js

    if not exist "node_modules" (
        echo [*] Instaluji zavislosti...
        call npm install
    )

    echo [*] Spoustim live-server...
    echo.
    call npm run dev
    goto end
)

REM Fallback - otevrit primo soubor
echo [!] Python ani Node.js nenalezeny
echo [*] Oteviram index.html primo v prohlizeci...
echo.
start index.html
echo [OK] Dokumentace otevrena v prohlizeci
echo [!] Nektere funkce nemusi fungovat spravne bez HTTP serveru
echo.
pause

:end