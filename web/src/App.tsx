import { useEffect, useRef, useState } from 'react';
import './App.css';
import "@babylonjs/loaders/glTF";
import { start } from './index';

let files: File[];
function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    //@ts-ignore
    const fl = evt.target.files as FileList;
    files = Array.from(fl);
    console.log('files: ', files);
  };

  const upload = () => {
    if (!files) return;
    const fd = new FormData();
    for (const f of files) {
      fd.append(f.name, f);
    }
    fetch("http://localhost:8088/upload", {
      method: "POST",
      body: fd,
    }).then(response => response.text()).then(res => {
      console.log('res: ', res);
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.parentElement!.clientWidth;
      canvasRef.current.height = canvasRef.current.parentElement!.clientHeight;
      start(canvasRef.current);
    }
  }, []);
  return (
    <div className="App">
      <div>
        <input onChange={onChange} multiple name="file" type="file" />
        <button onClick={upload}>上传</button>
      </div>
      <div>
        <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
