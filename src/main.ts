// import * as PIXI from 'pixi.js';
// import { Menu } from './Menu';
// import { AceOfShadows } from './scenes/AceOfShadows';

// // Create Pixi App
// const app = new PIXI.Application({
//   backgroundColor: 0x1e1e1e,
//   resizeTo: window,
// });

// const aceOfShadows = new AceOfShadows(app); 

// document.body.appendChild(app.view as HTMLCanvasElement);

// // FPS Counter
// const fpsText = new PIXI.Text('FPS: 0', {
//   fontFamily: 'Arial',
//   fontSize: 24,
//   fill: 'white',
// });
// fpsText.position.set(10, 10);
// app.stage.addChild(fpsText);

// // Update FPS
// let lastTime = performance.now();
// let frameCount = 0;
// app.ticker.add(() => {
//   frameCount++;
//   const now = performance.now();
//   if (now - lastTime >= 1000) {
//     fpsText.text = `FPS: ${frameCount}`;
//     frameCount = 0;
//     lastTime = now;
//   }
// });

// // Menu System
// const menu = new Menu(app, (task) => {
//   console.log(`Selected Task: ${task}`);
// });

// index.ts
// index.ts
import * as PIXI from 'pixi.js';
import { Menu } from './Menu';
import { Utils } from './utils';

const app = new PIXI.Application<HTMLCanvasElement>({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

// Display FPS counter
Utils.displayFPS(app);

// Fullscreen mode
app.view.style.position = 'absolute';
app.view.style.top = '0px';
app.view.style.left = '0px';
app.view.style.width = '100%';
app.view.style.height = '100%';
app.resizeTo = window;

new Menu(app);

