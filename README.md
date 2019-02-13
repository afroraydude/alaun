# Alaun

A simple Google Play Music standalone app with Discord integration


## Building


Windows:
```powershell
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true'

electron-builder --win
```

Linux:
```bash
#!/bin/bash
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

electron-builder --win
```