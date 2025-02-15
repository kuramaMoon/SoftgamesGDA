
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

Utils.displayFPS(app);

app.view.style.position = 'absolute';
app.view.style.top = '0px';
app.view.style.left = '0px';
app.view.style.width = '100%';
app.view.style.height = '100%';
app.resizeTo = window;

new Menu(app);

