# PowerShell Execution Policy Fix

## Problem

When running `pnpm` or `npm` scripts in PowerShell, you get this error:

```
pnpm : File C:\Users\A\AppData\Local\nvm\nodejs\pnpm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## Solution 1: Change Execution Policy (Recommended)

Run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

This allows running locally created scripts (like pnpm.ps1) while still protecting against malicious scripts from the internet.

## Solution 2: Use CMD Instead

You can use Command Prompt (CMD) instead of PowerShell:

```cmd
pnpm run lint
pnpm run format
pnpm run build
```

## Solution 3: Run Specific Commands in CMD

If you prefer to keep PowerShell's strict policy, you can run specific commands in CMD:

```powershell
cmd /c "pnpm run lint"
cmd /c "node_modules\.bin\eslint src"
```

## Current Workaround

We've been using CMD for ESLint commands:

```powershell
cmd /c "node_modules\.bin\eslint src 2>&1"
```

## Notes

- The execution policy is a security feature to prevent malicious scripts
- `RemoteSigned` allows local scripts but requires internet-downloaded scripts to be signed
- This only affects PowerShell, not the actual Node.js/npm/pnpm functionality
