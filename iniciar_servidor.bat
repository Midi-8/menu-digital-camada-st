@echo off
title Servidor Menu Digital - Camada Santo Tirso
echo ========================================================
echo   CAMADA SANTO TIRSO - MENU DIGITAL & COZINHA (KDS)
echo ========================================================
echo A iniciar servidor local...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
