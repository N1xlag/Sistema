@echo off
title EcoLlajta Smart-Twin - Encendido Automatico
echo ===================================================
echo    Iniciando el Motor del Simulador EcoLlajta...
echo ===================================================
echo.

echo [1/3] Encendiendo el Servidor Backend...
cd backend
start "EcoLlajta BACKEND" cmd /c "npm run dev"
cd ..

echo [2/3] Encendiendo la Interfaz Frontend...
cd frontend
start "EcoLlajta FRONTEND" cmd /c "npm run dev"
cd ..

echo [3/3] Abriendo el panel de control en tu navegador...
:: Esperamos 5 segundos para darle tiempo a que los servidores arranquen
timeout /t 5 /nobreak > NUL
start http://localhost:4000

echo.
echo ¡Todo listo! Puedes minimizar esta ventana.
pause