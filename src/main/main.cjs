const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// DOMMatrix Polyfill for Electron Main Process / pdf-parse
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    inverse() { return this; }
    transformPoint(p) { return p; }
  };
}

let mainWindow;

// Start Express Backend Engine inside Desktop App
function startBackend() {
  const isDev = !app.isPackaged;

  if (!isDev) {
    try {
      // 1. Ensure Writable AppData Directory Exists
      const userDataPath = app.getPath('userData');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }

      const targetDbPath = path.join(userDataPath, 'dev.db');
      const templateDbPath = path.join(app.getAppPath(), 'prisma', 'dev.db');

      // 2. ONLY COPY IF DATABASE DOES NOT EXIST ON DISK (NEVER OVERWRITE EXISTING DATA!)
      if (!fs.existsSync(targetDbPath) && fs.existsSync(templateDbPath)) {
        try {
          fs.copyFileSync(templateDbPath, targetDbPath);
          console.log('[StudentOS Desktop] Initialized new dev.db in AppData');
        } catch (copyErr) {
          console.error('[StudentOS Desktop] Copy DB Error:', copyErr);
        }
      }

      // 3. Format as Prisma-Compatible Windows File URL (file:C:/...)
      const normalizedPath = targetDbPath.replace(/\\/g, '/');
      const dbUrl = `file:${normalizedPath}`;
      process.env.DATABASE_URL = dbUrl;
      console.log('[StudentOS Desktop] DATABASE_URL set to:', dbUrl);

      // 4. Load bundled Express server
      const serverPath = path.join(app.getAppPath(), 'dist', 'server.cjs');
      console.log('[StudentOS Desktop] Requiring Server from:', serverPath);
      require(serverPath);
    } catch (err) {
      console.error('[StudentOS Desktop Backend Error]:', err);
      dialog.showErrorBox(
        'StudentOS Backend Error',
        `Failed to start local Express server:\n\n${err.stack || err.message}`
      );
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'StudentOS — Academic Workspace',
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});