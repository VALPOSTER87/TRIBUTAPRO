@echo off
chcp 65001 > nul
title TributaPro AGT - Versao Offline Pen Drive
echo =====================================================================
echo           TRIBUTAPRO AGT - VERSAO OFFLINE PORTATIL
echo =====================================================================
echo Iniciando servidor local offline na porta 8080...
echo O seu navegador sera aberto automaticamente em: http://localhost:8080
echo.
echo Para partilhar com o seu telemovel na mesma rede Wi-Fi / Hotspot:
echo Aceda pelo telemovel ao IP deste computador (ex: http://192.168.1.X:8080)
echo.
echo Para encerrar o programa, basta fechar esta janela.
echo =====================================================================

REM Abre o navegador apos 2 segundos
start "" cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:8080"

REM Tenta iniciar servidor via Python nativo se existir
python --version > nul 2>&1
if %errorlevel% equ 0 (
    python -m http.server 8080
    goto end
)

python3 --version > nul 2>&1
if %errorlevel% equ 0 (
    python3 -m http.server 8080
    goto end
)

REM Servidor HTTP nativo via PowerShell (Zero instalacao, embutido em qualquer Windows 10/11)
powershell -NoProfile -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://*:8080/'); $listener.Start(); Write-Host 'Servidor ativo em http://localhost:8080...'; while ($listener.IsListening) { $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response; $rawPath = $req.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = 'index.html' }; $filePath = Join-Path (Get-Location) $rawPath; if (Test-Path $filePath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $res.ContentType = 'text/html; charset=utf-8' } '.js' { $res.ContentType = 'application/javascript; charset=utf-8' } '.css' { $res.ContentType = 'text/css; charset=utf-8' } '.json' { $res.ContentType = 'application/json' } '.png' { $res.ContentType = 'image/png' } '.svg' { $res.ContentType = 'image/svg+xml' } default { $res.ContentType = 'application/octet-stream' } }; $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404 }; $res.OutputStream.Close() }"

:end
pause
