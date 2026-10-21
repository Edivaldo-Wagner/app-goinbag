@echo off
title Iniciar App Goinbag
echo Configurando Java 17...

set "JAVA_HOME=C:\Users\Edivaldo Wagner\AppData\Local\Programs\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo.
java -version
echo.
echo Iniciando o aplicativo React Native...
cd /d C:\app_goinbag

npx react-native run-android

echo.
echo Processo finalizado. Pressione uma tecla para fechar.
pause