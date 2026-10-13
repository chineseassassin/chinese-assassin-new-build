$content = git show "556095a:cinematic-dj/index.html"
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    $l = $lines[$i]
    if ($l -match "id=" -or $l -match "class=" -and ($l -match "page" -or $l -match "section" -or $l -match "modal" -or $l -match "hub" -or $l -match "deck" -or $l -match "intro" -or $l -match "doors")) {
        Write-Host "$($i+1): $($l.Trim())"
    }
}
