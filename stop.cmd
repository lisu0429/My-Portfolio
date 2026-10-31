@echo off
cd /d "%~dp0"
set "PORT=5173"

netstat -ano | findstr /C:":%PORT% " | findstr /C:"LISTENING" >nul
if errorlevel 1 goto none

echo.
echo   正在停止占用端口 %PORT% 的进程 ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%PORT% " ^| findstr /C:"LISTENING"') do (
    echo     - PID %%p
    taskkill /PID %%p /F >nul 2>&1
)
echo.
echo   已停止。开发服务器同时关闭，日志文件 dev-server.log 保留在项目目录。
echo.
pause
exit /b 0

:none
echo.
echo   端口 %PORT% 上没有运行中的服务，无需停止。
echo.
pause