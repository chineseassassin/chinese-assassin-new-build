$commits = git log --oneline -5
foreach ($c in $commits) {
    $hash = $c.Split(' ')[0]
    $files = git ls-tree -r $hash --name-only
    Write-Host "Commit $hash has files:"
    $files | ForEach-Object { "  $_" }
}
