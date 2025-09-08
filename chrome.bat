@echo off
set "HTML_FILE=%~dp0main.htm"
If exist "C:\Program Files\Google\Chrome\Application\chrome.exe" ("C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=log "file:///%HTML_FILE%")
If exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" ("C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=log "file:///%HTML_FILE%")
