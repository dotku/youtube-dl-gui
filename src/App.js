// import { ipcRenderer } from "electron";
import { useState, useEffect } from "react";

export default function App() {
  const [tag, setTag] = useState("fMSgzzkdjk4");
  const [logs, setLogs] = useState([]);

  // const { ipcRenderer } = window.require("electron");
  const handleDownloadClick = () => {
    // console.log("ipcRenderer", ipcRenderer);
    console.log("Electron", window.Electron);
    console.log("youtube-dl", window.electron["youtube-dl"](tag));
    // ipcRenderer.send(`youtube-dl ${tag}`);
  };

  useEffect(() => {
    const { response } = window.electron;
    if (!response) {
      console.error("response failed");
      console.log(window.electron);
      return;
    }
    response("fromMain", (data) => {
      // console.log("msg", data);
      const prevLimit = 9;
      setLogs((prev) => [
        data,
        ...prev.filter((_item, idx) => idx < prevLimit),
      ]);
    });
  }, []);

  return (
    <div className="App">
      <h1>Media Downloader</h1>
      <input
        placeholder="Place Youtube URL or Tag Here"
        defaultValue={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <button onClick={handleDownloadClick}>Download</button>
      <div>
        {logs.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
      <footer>
        <h3>README</h3>
        <ol>
          <li>
            Input the video URL or tag, eg
            https://www.youtube.com/watch?v=kBrPkGRiWJY then, input
            `https://www.youtube.com/watch?v=kBrPkGRiWJY` or `kBrPkGRiWJY`
          </li>
          <li>It dose support short.</li>
        </ol>
      </footer>
    </div>
  );
}
