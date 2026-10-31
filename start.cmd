@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "PORT=5173"
set "URL=http://127.0.0.1:%PORT%/"
set "LOG=%~dp0dev-server.log"
set "QUIET=%1"

title 李彬作品集 - 本地预览

echo.
echo   ============================================
echo      李彬 · AI 产品经理 · 个人作品集
echo      本地预览启动器
echo   ============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto nonode

if not exist "node_modules\vite\bin\vite.js" goto install
echo   [1/3] 依赖已就绪
goto depsdone

:install
echo   [1/3] 首次运行，正在安装依赖 npm install ...
echo.
call npm install
if errorlevel 1 goto installfail
echo.

:depsdone
netstat -ano | findstr /C:":%PORT% " | findstr /C:"LISTENING" >nul
if not errorlevel 1 goto occupied
goto startserver

:nonode
echo   [x] 未检测到 Node.js
echo       请先安装 Node.js ^(https://nodejs.org/^) 后重新运行本文件
echo.
pause
exit /b 1

:installfail
echo.
echo   [x] 依赖安装失败，请检查网络后重试
echo.
pause
exit /b 1

:occupied
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri 'http://127.0.0.1:%PORT%/'; if($r.Content -match 'libin-portfolio'){exit 0}else{exit 1} } catch { exit 2 }" >nul 2>&1
if errorlevel 1 goto foreign
echo   [2/3] 检测到本地服务已在运行，直接打开浏览器
echo.
if not "%QUIET%"=="--quiet" start "" "%URL%"
echo   地址：%URL%
echo   日志：dev-server.log
echo.
goto menu

:foreign
echo   [注意] 端口 %PORT% 被其它程序占用
choice /c YN /n /m "       结束占用进程并重新启动？(Y/N) : "
if errorlevel 2 goto cancel
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%PORT% " ^| findstr /C:"LISTENING"') do taskkill /PID %%p /F >nul 2>&1
ping -n 2 127.0.0.1 >nul
goto startserver

:cancel
echo       已取消启动。
echo.
pause
exit /b 0

:startserver
echo   [2/3] 正在启动开发服务器 ...
start "Vite Dev Server" /min cmd /c "npm run dev 1>dev-server.log 2>&1"

echo   [3/3] 等待服务就绪 ...
set /a tries=0
:wait
ping -n 2 127.0.0.1 >nul
netstat -ano | findstr /C:":%PORT% " | findstr /C:"LISTENING" >nul
if not errorlevel 1 goto ready
set /a tries+=1
if !tries! gtr 45 goto failed
goto wait

:ready
echo.
echo   ============================================
echo      服务已启动
echo      %URL%
echo   ============================================
echo.
if not "%QUIET%"=="--quiet" start "" "%URL%"
echo   已自动打开浏览器。如未打开，请手动访问上面的地址。
echo.
type "%LOG%"
echo.
echo   停止服务：运行 stop.cmd ，或在本窗口按 S 键
echo.

:menu
if "%QUIET%"=="--quiet" goto end
choice /c SN /n /m "   按 [S] 停止服务并退出，按 [N] 保留服务并退出 : "
if errorlevel 2 goto end
if errorlevel 1 goto stop

:stop
echo.
echo   正在停止服务 ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%PORT% " ^| findstr /C:"LISTENING"') do taskkill /PID %%p /F >nul 2>&1
echo   已停止。
echo.
pause
exit /b 0

:failed
echo.
echo   [x] 服务启动超时或失败，请查看 dev-server.log
echo.
type "%LOG%"
echo.
pause
exit /b 1

:end
echo.
pause
exit /b 0