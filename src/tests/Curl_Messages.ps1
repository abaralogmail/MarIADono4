$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadPath = Join-Path $scriptDir "..\payload.json"
$token = $null
if (Test-Path $payloadPath) {
	try {
		$json = Get-Content -Raw -Path $payloadPath | ConvertFrom-Json
		if ($json -and $json.META_WHATSAPP_TOKEN) {
			$token = $json.META_WHATSAPP_TOKEN
		}
	} catch {
		Write-Host "Warning: failed to parse payload.json: $($_.Exception.Message)"
	}
}
if (-not $token) {
	$token = $env:META_WHATSAPP_TOKEN
	if (-not $token) { Write-Host "Warning: META_WHATSAPP_TOKEN not found in payload.json or environment; proceeding with empty token." }
	else { Write-Host "Using token from environment variable META_WHATSAPP_TOKEN." }
} else {
	Write-Host "Using token extracted from payload.json."
}
$curlArgs = @(
	'-i',
	'-X', 'POST',
	'https://43h0tcgt-3000.brs.devtunnels.ms//v1/messages',
	'-H', "Authorization: Bearer $token",
	'-H', 'Content-Type: application/json',
	'--data-binary', '@payload-message.json'
)
& curl.exe @curlArgs