@echo off
echo Синхронизация папок app и W8dpUuQw...

REM Синхронизация из app в W8dpUuQw
xcopy app\* W8dpUuQw\ /E /H /Y /Q

echo Синхронизация завершена!
echo Теперь обе папки содержат одинаковые файлы.
pause
