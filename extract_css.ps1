$css = git show 556095a:cinematic-dj/src/style.css
$lines = $css -split "`n"
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "CINEMATIC INTRO & TEMPLE DOORS" -or $lines[$i] -match "intro-door") {
        if ($start -eq -1) { $start = $i }
    }
    if ($start -ge 0 -and $lines[$i] -match "dimension-hub|site-header") {
        $end = $i
        break
    }
}
Write-Host "Found intro CSS from line $start to $end"
if ($start -ge 0 -and $end -gt $start) {
    $lines[$start..$end] | Out-File "c:\SadTalker\cinematic-dj\intro_extracted.css" -Encoding UTF8
    Write-Host "Extracted $(($end - $start)) lines to intro_extracted.css"
}
