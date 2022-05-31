// Modules to control application life and create native browser window

// eslint-disable-next-line
// @ts-ignore:next-line
/* tslint:disable-next-line */
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { spawn } = require("child_process");

let mainWindow;

ipcMain.handle("ls", () => {
  exec("ls -la", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  isDev && mainWindow.webContents.openDevTools();
}

ipcMain.on("youtube-dl", async (_e, args) => {
  if (!args) {
    console.error("undefined args");
    return;
  }
  const { tag } = args;
  // console.log("youtube-dl tag", tag);

  try {
    const youtubeDL = spawn(`youtube-dl`, [tag]);
    youtubeDL.stdout.on("data", function (data) {
      try {
        console.log("stdout: " + data.toString());
        // ipcMain.emit("youtube-dl", data.toString());
        mainWindow.webContents.send("youtube-dl", data.toString());
        mainWindow.webContents.send("fromMain", data.toString());
      } catch (e) {
        console.error(e);
        mainWindow.webContents.send("fromMain", e.toString());
        youtubeDL.kill();
      }
    });

    youtubeDL.stderr.on("data", function (data) {
      try {
        console.log("stderr: " + data.toString());
        mainWindow.webContents.send("youtube-dl", data.toString());
        mainWindow.webContents.send("fromMain", data.toString());
      } catch (e) {
        console.error(e);
        mainWindow.webContents.send("fromMain", e.toString());
        youtubeDL.kill();
      }
    });
  } catch (e) {
    console.error(e);
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
