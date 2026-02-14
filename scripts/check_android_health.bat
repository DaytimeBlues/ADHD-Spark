@echo off
echo [*] Checking Android environment health...

:: Check JAVA_HOME
if "%JAVA_HOME%"=="" (
    echo [!] ERROR: JAVA_HOME is not set.
) else (
    echo [OK] JAVA_HOME is set to %JAVA_HOME%
    "%JAVA_HOME%\bin\java" -version 2>&1
)

:: Check ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    echo [!] ERROR: ANDROID_HOME is not set.
) else (
    echo [OK] ANDROID_HOME is set to %ANDROID_HOME%
)

:: Check local.properties
if exist "android\local.properties" (
    echo [OK] android\local.properties exists.
) else (
    echo [!] WARNING: android\local.properties is missing. Android Studio usually creates this.
)

:: Try running gradlew help
cd android
if exist "gradlew.bat" (
    echo [*] Attempting to run gradlew help...
    call gradlew.bat help -q
    if %errorlevel% equ 0 (
        echo [OK] Gradle wrapper is working correctly.
    ) else (
        echo [!] ERROR: Gradle execution failed.
    )
) else (
    echo [!] ERROR: gradlew.bat not found in android folder.
)
cd ..

echo [*] Health check complete.
