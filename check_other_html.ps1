Write-Host "=== cinematic-portal/index.html ==="
Get-Content "C:\SadTalker\cinematic-portal\index.html" | Select-String -Pattern "id=|class=" | Select-Object -First 15 | ForEach-Object { $_.Line.Trim() }

Write-Host "`n=== cinematic-dj/player.html ==="
Get-Content "C:\SadTalker\cinematic-dj\player.html" | Select-String -Pattern "id=|class=" | Select-Object -First 15 | ForEach-Object { $_.Line.Trim() }

Write-Host "`n=== cinematic-dj/streaming.html ==="
Get-Content "C:\SadTalker\cinematic-dj\streaming.html" | Select-String -Pattern "id=|class=" | Select-Object -First 15 | ForEach-Object { $_.Line.Trim() }
