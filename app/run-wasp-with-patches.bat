@echo off
echo Starting Wasp with automatic patching...
echo.

REM Run the wasp build command
call wasp build

echo.
echo Applying patches to fix TypeScript errors...
echo.

REM Run our patch script
call npm run apply-patches

echo.
echo Setup complete! You can now run your application.
echo.
