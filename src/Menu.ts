// menu.ts
import * as PIXI from 'pixi.js';

export class Menu {
    private app: PIXI.Application;
    private menuContainer: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.menuContainer = new PIXI.Container();
        this.app.stage.addChild(this.menuContainer);

        this.createMenu();
    }

    private createMenu() {
        const style = new PIXI.TextStyle({
            fill: 'white',
            fontSize: 36,
            fontFamily: 'Arial',
        });

        const title = new PIXI.Text('Game Developer Assignment', style);
        title.x = this.app.screen.width / 2 - title.width / 2;
        title.y = 100;
        this.menuContainer.addChild(title);

        const options = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        options.forEach((option, index) => {
            const buttonContainer = new PIXI.Container();
            buttonContainer.interactive = true;
            (buttonContainer as any).buttonMode = true;

            const buttonText = new PIXI.Text(option, style);
            buttonText.x = this.app.screen.width / 2 - buttonText.width / 2;
            buttonText.y = 200 + index * 80;
            buttonContainer.addChild(buttonText);

            buttonContainer.on('pointerdown', () => this.selectOption(index));
            this.menuContainer.addChild(buttonContainer);
        });
    }

    private selectOption(index: number) {
        this.menuContainer.visible = false;

        switch (index) {
            case 0:
                import('./scenes/AceOfShadows').then(({ AceOfShadows }) => {
                    new AceOfShadows(this.app);
                });
                break;
            case 1:
                import('./scenes/MagicWords').then(({ MagicWords }) => {
                    new MagicWords(this.app);
                });
                break;
            case 2:
                import('./scenes/PhoenixFlame').then(({ PhoenixFlame }) => {
                    new PhoenixFlame(this.app);
                });
                break;
        }
    }
}