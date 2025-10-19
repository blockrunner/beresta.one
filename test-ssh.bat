@echo off
echo Testing SSH connection to berisk.beget.tech...
echo.

REM Test SSH connection
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL berisk_beresta@berisk.beget.tech "pwd && ls -la"

echo.
echo SSH test completed.
pause
