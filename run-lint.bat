@echo off
echo Running ESLint on Windows...
node_modules\.bin\eslint.cmd src --max-warnings 100
if %errorlevel% equ 0 (
    echo ESLint completed successfully with warnings (no errors)
) else (
    echo ESLint failed with errors
    exit /b %errorlevel%
)