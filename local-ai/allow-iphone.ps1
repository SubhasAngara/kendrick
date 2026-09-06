param(
    [Parameter(Mandatory=$true)][string]$PhoneAddress
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$connection = Get-Content -LiteralPath (Join-Path $PSScriptRoot '.connection.json') | ConvertFrom-Json
$computerAddress = ([uri]$connection.url).Host
$phoneIP = [System.Net.IPAddress]::Parse($PhoneAddress)
if ($phoneIP.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork -or $PhoneAddress -notmatch '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)') {
    throw 'Use the private IPv4 address shown in your iPhone Wi-Fi settings.'
}
$adapter = Get-NetIPAddress -AddressFamily IPv4 -IPAddress $computerAddress
$pythonPath = (& (Join-Path $PSScriptRoot '.venv/Scripts/python.exe') -c 'import sys; print(sys._base_executable)').Trim()
$nodePath = (Get-Command node).Source
$specs = @(
    @{Name='Kendrick-iPhone-AI'; Port=8787; Program=$pythonPath},
    @{Name='Kendrick-iPhone-Expo'; Port=8081; Program=$nodePath}
)
$created = @()
try {
    foreach ($spec in $specs) {
        if (Get-NetFirewallRule -Name $spec.Name -ErrorAction SilentlyContinue) {
            throw ('Rule already exists: ' + $spec.Name + '. Inspect it before making changes.')
        }
        New-NetFirewallRule -Name $spec.Name -DisplayName $spec.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $spec.Port -LocalAddress $computerAddress -RemoteAddress $PhoneAddress -Program $spec.Program -InterfaceAlias $adapter.InterfaceAlias -Profile Public,Private -Description 'Kendrick local development: one named iPhone, one program and port. No access to the Ollama model server.' | Out-Null
        $created += $spec.Name
    }
} catch {
    # Roll back only the exact rules created by this invocation if setup fails.
    foreach ($name in $created) { Remove-NetFirewallRule -Name $name }
    throw
}
$created | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot 'work/kendrick-firewall-rules.json')
Write-Output "Allowed only iPhone $PhoneAddress to reach $computerAddress on TCP 8787 and 8081."
