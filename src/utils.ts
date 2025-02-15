// utils.ts
import * as PIXI from 'pixi.js';

export class Utils {
    static displayFPS(app: PIXI.Application<HTMLCanvasElement>) {
        const style = new PIXI.TextStyle({
            fill: ['white', 'yellow'], 
            fontSize: 24,
            fontFamily: 'Arial',
            stroke: 'black',          
            strokeThickness: 2,
        });

        const fpsText = new PIXI.Text('FPS: ', style);
        fpsText.x = Math.min(10, app.screen.width * 0.05);
        fpsText.y = Math.min(10, app.screen.height * 0.05); 
        app.stage.addChild(fpsText);

        let lastFps = 0;

        app.ticker.add(() => {
            const currentFps = Math.round(app.ticker.FPS);
            if (currentFps !== lastFps) {
                fpsText.text = `FPS: ${currentFps}`;
                lastFps = currentFps;
            }
        });
    }
}