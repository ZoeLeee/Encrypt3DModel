import { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import "@babylonjs/loaders/glTF";
import { start } from './index';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      start(canvasRef.current);
    }
  }, []);
  return (
    <div className="App">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
