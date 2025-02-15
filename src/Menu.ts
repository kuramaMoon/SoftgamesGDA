import * as PIXI from 'pixi.js';

export class Menu {
    private app: PIXI.Application;
    private menuContainer: PIXI.Container;
    private currentScene: any; 
    private buttons: PIXI.Container[] = []; 

    constructor(app: PIXI.Application) {
        this.app = app;
        this.menuContainer = new PIXI.Container();
        this.app.stage.addChild(this.menuContainer);
        this.currentScene = null; 
        this.createMenu();
    }

    private createMenu() {
        const style = new PIXI.TextStyle({
            fill: 'white', 
            fontSize: 30, 
            fontFamily: 'Arial',
        });

        const title = new PIXI.Text('Game Developer Assignment', style);
        title.x = this.app.screen.width / 2 - title.width / 2; 
        title.y = 50; 
        this.menuContainer.addChild(title);

        const options = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        options.forEach((option, index) => {
            const buttonContainer = new PIXI.Container();

            const box = new PIXI.Graphics();
            box.lineStyle(2, 0xFF0000); 
            box.beginFill(0x000000);
            box.drawRect(0, 0, 400, 60); 
            box.endFill();
            box.x = 0; 
            box.y = 0;

            buttonContainer.interactive = true;
            (buttonContainer as any).buttonMode = true;

            buttonContainer.hitArea = new PIXI.Rectangle(0, 0, 400, 60);

            buttonContainer.on('pointerover', () => {
                box.clear();
                box.lineStyle(2, 0xFFA500); 
                box.beginFill(0x000000); 
                box.drawRect(0, 0, 400, 60); 
                box.endFill();
            });
            buttonContainer.on('pointerout', () => {
                box.clear();
                box.lineStyle(2, 0xFF0000); 
                box.beginFill(0x000000); 
                box.drawRect(0, 0, 400, 60); 
                box.endFill();
            });

            buttonContainer.on('pointerdown', () => {
                this.repositionMenu(); 
                this.selectOption(index);
            });

            const buttonText = new PIXI.Text(option, style);
            buttonText.anchor.set(0.5);
            buttonText.x = 200;
            buttonText.y = 30; 

            buttonContainer.addChild(box);
            buttonContainer.addChild(buttonText);

            buttonContainer.x = this.app.screen.width / 2 - 200;
            buttonContainer.y = 150 + index * 80; 

            this.buttons.push(buttonContainer);
            this.menuContainer.addChild(buttonContainer);
        });
    }

    private repositionMenu() {
        this.buttons.forEach((button, index) => {
            button.x = 10; 
            button.y = 70 + index * 80;
        });

        this.menuContainer.scale.set(0.7);
    }

    private selectOption(index: number) {
        this.menuContainer.children.forEach((child) => {
            if (child instanceof PIXI.Text && child.text === 'Game Developer Assignment') {
                this.menuContainer.removeChild(child);
            }
        });
    
        if (this.currentScene) {
            this.currentScene.destroy();
            this.currentScene = null; 
        }
    
        switch (index) {
            case 0:
                import('./scenes/AceOfShadows').then(({ AceOfShadows }) => {
                    this.currentScene = new AceOfShadows(this.app); 
                });
                break;
            case 1:
                import('./scenes/MagicWords').then(({ MagicWords }) => {
                    this.currentScene = new MagicWords(this.app); 
                });
                break;
            case 2:
                import('./scenes/PhoenixFlame').then(({ PhoenixFlame }) => {
                    this.currentScene = new PhoenixFlame(this.app); 
                });
                break;
        }
    }
}    