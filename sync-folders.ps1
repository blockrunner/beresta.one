# Синхронизация папок app и W8dpUuQw
Write-Host "Синхронизация папок app и W8dpUuQw..." -ForegroundColor Green

# Синхронизация из app в W8dpUuQw
Copy-Item -Path "app\*" -Destination "W8dpUuQw\" -Recurse -Force

Write-Host "Синхронизация завершена!" -ForegroundColor Green
Write-Host "Теперь обе папки содержат одинаковые файлы." -ForegroundColor Yellow
