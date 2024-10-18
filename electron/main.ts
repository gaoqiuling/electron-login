import { app, BrowserWindow, dialog, IpcMainEvent, Menu, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const feedUrl = "https://www.uniquecat.cc/authdownload";
let checkUpdateFromMenu: boolean;

interface Message {
  version: String;
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({

    width: 600,
    height: 600,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', "App starting at " + (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.webContents.on('devtools-opened', () => {
    if (win) {
      win.setFullScreen(true);
    }
  });

  win.webContents.on('devtools-closed', () => {
    if (win) {
      win.setFullScreen(false);
    }
  });
}

function checkForUpdates() {
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(feedUrl);

  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', function (message: Message) {
    sendUpdateMessage('error', message, true);
  });
  autoUpdater.on('checking-for-update', function (message: Message) {
    sendUpdateMessage('checking-for-update', message, true);
  });
  autoUpdater.on('update-available', function (message: Message) {
    sendUpdateMessage('update-available', message, checkUpdateFromMenu);
    checkUpdateFromMenu = false;
  });
  autoUpdater.on('update-not-available', function (message: Message) {
    if (checkUpdateFromMenu) {
      dialog.showMessageBox(win, {
        type: 'info', title: '当前已是最新',
        message: `最新版本为 ${message.version}, 当前版本为 ${app.getVersion()}`
      });
      checkUpdateFromMenu = false;
    } else {
      sendUpdateMessage('update-not-available', message, true);
    }

  });

  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function (event: String, releaseNotes: String, releaseName: String, releaseDate: String, updateUrl: String, quitAndUpdate: boolean) {
    console.log("------------------监听到下载完成--------------")
    console.log("event: %s, releaseNotes: %s, releaseName: %s, releaseDate: %, updateUrl: %s, quitAndUpdate: %s", event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate);
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('updateNow', (e: IpcMainEvent, arg: any) => {
    autoUpdater.downloadUpdate();
  });
  //执行自动更新检查
  autoUpdater.checkForUpdates();
};

ipcMain.on('update', (e: IpcMainEvent, arg: any) => {
  console.log("--------------监听渲染进程的update，检查是否需要更新------------");
  checkForUpdates();
});


// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message: String, data: Message, checkUpdateFromMenu: boolean) {
  console.log("message: %s, ", message);
  console.log("data: %s", data);
  win?.webContents.send('upgrade_message', { message, data, checkUpdateFromMenu });
}

//自动更新
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// autoUpdater.autoDownload = false;

const template = [
  {
    label: `查看`,
    submenu: [
      {
        label: `打开控制台`,
        role: 'toggleDevTools'
      },
    ],
  },
  {
    label: "帮助",
    submenu: [
      {
        label: "查看更新",
        click: () => {
          checkUpdateFromMenu = true;
          //执行自动更新检查
          autoUpdater.checkForUpdates();
        }
      }]
  }
]
var list = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(list);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

app.whenReady().then(createWindow)
