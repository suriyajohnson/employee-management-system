@echo off
setlocal
cd /d "%~dp0"
if defined JAVA_HOME goto run
for /d %%J in ("%USERPROFILE%\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_21.*") do if exist "%%~fJ\jre\bin\java.exe" set "JAVA_HOME=%%~fJ\jre"
:run
echo Starting PeopleDesk. Open http://localhost:8082/ unless PORT is configured.
call "%~dp0mvnw.cmd" spring-boot:run
if errorlevel 1 pause
endlocal
