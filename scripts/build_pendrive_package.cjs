const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const targetDir = path.resolve(__dirname, '..', 'PENDRIVE_TRIBUTAPRO_OFFLINE');

if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Copy dist files into PENDRIVE_TRIBUTAPRO_OFFLINE
function copyFolder(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  copyFolder(distDir, targetDir);
}

// 1. INICIAR_TRIBUTAPRO_WINDOWS.bat
const batContent = `@echo off
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
`;
fs.writeFileSync(path.join(targetDir, 'INICIAR_TRIBUTAPRO_WINDOWS.bat'), batContent, 'utf8');

// 2. INICIAR_TRIBUTAPRO_MAC_LINUX.sh
const shContent = `#!/usr/bin/env bash
echo "====================================================================="
echo "          TRIBUTAPRO AGT - VERSAO OFFLINE PORTATIL"
echo "====================================================================="
echo "Iniciando servidor local offline na porta 8080..."
echo ""
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
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
`;
fs.writeFileSync(path.join(targetDir, 'INICIAR_TRIBUTAPRO_MAC_LINUX.sh'), shContent, 'utf8');
fs.chmodSync(path.join(targetDir, 'INICIAR_TRIBUTAPRO_MAC_LINUX.sh'), 0o755);

// 3. LEIA-ME_PENDRIVE.txt
const readmeContent = `=====================================================================
          TRIBUTAPRO AGT - VERSAO PORTATIL PARA PEN DRIVE
=====================================================================

Esta pasta contem a versao completa e autossuficiente do TributaPro AGT,
pronta para ser armazenada e partilhada em qualquer Pen Drive (Flash Drive USB)
e executada 100% OFFLINE em qualquer computador, sem necessidade de internet.

---------------------------------------------------------------------
COMO USAR NO COMPUTADOR (WINDOWS / MAC / LINUX)
---------------------------------------------------------------------
1. Copie esta pasta completa para a sua Pen Drive.
2. Em qualquer computador, abra a pasta da Pen Drive.
3. Clique duas vezes no iniciador correspondente ao seu sistema:
   - No Windows: Execute 'INICIAR_TRIBUTAPRO_WINDOWS.bat'
   - No Mac ou Linux: Execute 'INICIAR_TRIBUTAPRO_MAC_LINUX.sh'
4. O navegador abrira automaticamente em: http://localhost:8080 com
   todas as funcionalidades ativas:
   - Calculo automatizado de retencoes na fonte (6.5%, 10.5%, IVA, Predial, IRT)
   - Emissao de Guias DAR e RUPE com impressao e exportacao em PDF
   - Modulo de Simulacao Fiscal (Simples Nacional, Lucro Presumido, Lucro Real)
   - Importacao e exportacao de planilhas Excel (.xlsx) e CSV
   - Exportacao oficial AGT Modelo 1, Modelo 2 e SAF-T (AO)
   - Integracao com Primavera, PHC, SAP e Sage

---------------------------------------------------------------------
COMO TESTAR NO TELEMOVEL (SMARTPHONE) A PARTIR DA PEN DRIVE
---------------------------------------------------------------------
Para testar e instalar no seu telemovel a partir do computador onde
a pen drive esta ligada (mesmo sem internet!):

1. Ligue o telemovel e o computador a mesma rede Wi-Fi ou ligue o
   Hotspot / Ponto de Acesso Movel do telemovel e conecte o computador.
2. Inicie o TributaPro no computador ('INICIAR_TRIBUTAPRO_WINDOWS.bat').
3. No computador, veja o endereco IP local (ex: 192.168.1.45).
4. No navegador do telemovel (Chrome ou Safari), digite:
   http://192.168.1.45:8080 (substitua pelo IP do computador).
5. O aplicativo abre de imediato no smartphone e pode ser instalado
   como PWA clicando em 'Adicionar ao Ecra Principal'.

---------------------------------------------------------------------
DADOS E SEGURANCA
---------------------------------------------------------------------
- Todos os dados, faturas e guias sao salvos no armazenamento local
  (IndexedDB / LocalStorage) do navegador.
- Pode usar a opcao 'Backup para Pen Drive' na aplicacao para salvar
  uma copia de seguranca em formato JSON diretamente na Pen Drive.

Desenvolvido para conformidade fiscal com a legislacao da Republica de Angola
(Lei n. 26/20, Codigo do IVA, Codigo do IRT, AGT).
=====================================================================
`;
fs.writeFileSync(path.join(targetDir, 'LEIA-ME_PENDRIVE.txt'), readmeContent, 'utf8');

// 4. Create ZIP package in public directory for 1-click browser download
async function createZipArchive() {
  const zip = new JSZip();

  function addFolderToZip(folderPath, zipFolder) {
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);
      if (item.isDirectory()) {
        addFolderToZip(fullPath, zipFolder.folder(item.name));
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(item.name, fileData);
      }
    }
  }

  addFolderToZip(targetDir, zip.folder('PENDRIVE_TRIBUTAPRO_OFFLINE'));

  const publicDir = path.resolve(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(publicDir, 'TributaPro_PenDrive_Offline.zip'), zipBuffer);
  console.log('Zip package created at public/TributaPro_PenDrive_Offline.zip (' + Math.round(zipBuffer.length / 1024) + ' KB)');
}

createZipArchive().then(() => {
  console.log('SUCCESS: PENDRIVE_TRIBUTAPRO_OFFLINE package generated completely!');
});
