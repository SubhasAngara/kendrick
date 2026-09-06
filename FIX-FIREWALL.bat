@echo off
:: Right-click this file -> Run as administrator
netsh advfirewall firewall delete rule name="Kendrick Local AI 8787" >nul 2>&1
netsh advfirewall firewall add rule name="Kendrick Local AI 8787" dir=in action=allow protocol=TCP localport=8787 profile=any
netsh advfirewall firewall delete rule name="Kendrick Expo 8083" >nul 2>&1
netsh advfirewall firewall add rule name="Kendrick Expo 8083" dir=in action=allow protocol=TCP localport=8083 profile=any
echo.
echo Firewall opened for Kendrick (8787 + 8083).
echo Now in the app Settings use:
echo   Computer address: http://192.168.102.128:8787
echo   Pairing code:     978d66a929d0570a
echo.
pause
