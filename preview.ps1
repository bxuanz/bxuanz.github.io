param(
    [int]$Port = 8123
)

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existing) {
    Start-Process "http://127.0.0.1:$Port/"
    Write-Host "Preview already running at http://127.0.0.1:$Port/"
    exit 0
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCommand) {
    Write-Error "Python was not found in PATH."
    exit 1
}

$serverArgs = @("-m", "http.server", $Port, "--bind", "127.0.0.1")

$process = Start-Process `
    -FilePath $pythonCommand.Source `
    -ArgumentList $serverArgs `
    -WorkingDirectory $PSScriptRoot `
    -PassThru

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:$Port/"

Write-Host "Preview started at http://127.0.0.1:$Port/"
Write-Host "Server PID: $($process.Id)"
Write-Host "Stop it with: Stop-Process -Id $($process.Id)"
