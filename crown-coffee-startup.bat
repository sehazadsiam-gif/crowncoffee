@echo off
title Crown Coffee Manager Startup
echo Launching Crown Coffee Manager Portal...

:: Check for Google Chrome (64-bit)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=https://www.crowncoffeebangladesh.xyz/manager
    exit
)

:: Check for Google Chrome (32-bit)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=https://www.crowncoffeebangladesh.xyz/manager
    exit
)

:: Check for Microsoft Edge (Chromium based)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://www.crowncoffeebangladesh.xyz/manager
    exit
)

:: Fallback: Open in default browser window if app mode launchers are not found in standard paths
start https://www.crowncoffeebangladesh.xyz/manager
exit
