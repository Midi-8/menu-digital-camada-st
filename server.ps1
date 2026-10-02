# Lightweight native PowerShell HTTP Server for Camada Menu Digital
$port = 5500
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host ">>> Servidor Camada ativo em http://localhost:$port/"
} catch {
    Write-Host "Falha ao iniciar na porta $port, tentando 5501..."
    $port = 5501
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Write-Host ">>> Servidor Camada ativo em http://localhost:$port/"
}

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.RawUrl.Split('?')[0]
        if ($urlPath -eq '' -or $urlPath -eq '/') {
            $urlPath = '/index.html'
        }

        # Normalize relative path
        $cleanPath = $urlPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $root $cleanPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.jpg'  { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.png'  { 'image/png' }
                '.svg'  { 'image/svg+xml' }
                '.webp' { 'image/webp' }
                Default { 'application/octet-stream' }
            }

            # Enable CORS and caching
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache")
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Ficheiro nao encontrado: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # continue listening on transient connection drops
    }
}
