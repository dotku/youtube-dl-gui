const { contextBridge, ipcRenderer } = require("electron");

const apiKey = "electron";

const api = {
  versions: process.versions,
  ls: (tag) => {
    console.log("tag", tag);
    console.log(ipcRenderer.invoke("ls"));
  },
  ["youtube-dl"]: (tag) => {
    console.log("preload youtube-dl", ipcRenderer.send("youtube-dl", { tag }));
  },
  request: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  response: (channel, func) => {
    console.log("response channel", channel);
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
      // ipcRenderer.on("fromMain", (args) => {
      //   console.log("preload response", args);
      // });
    }
  },
  // ipcRenderer,
};

contextBridge.exposeInMainWorld(apiKey, api);

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron", "youtube-dl"]) {
    console.log("process", process.versions);
    replaceText(`${type}-version`, process.versions[type]);
  }
});
