$lines = Get-Content "C:\Users\peter\.gemini\antigravity-ide\brain\ec435e02-1b13-4d4f-8ca6-1d6cf1c1f22e\.system_generated\logs\transcript_full.jsonl"
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "index\.html" -and $lines[$i] -match "Showing lines") {
        Write-Host "View file output at line $i"
    }
}
