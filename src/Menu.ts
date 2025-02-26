import * as PIXI from 'pixi.js';

export class Menu {
    private app: PIXI.Application;
    private menuContainer: PIXI.Container;
    private currentScene: any;
    private buttons: PIXI.Container[] = [];
    private title!: PIXI.Text;
    private isRepositioned: boolean = false;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.menuContainer = new PIXI.Container();
        this.app.stage.addChild(this.menuContainer);
        this.currentScene = null;
        
        this.createMenu();
    }

    private createMenu() {
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;
        const buttonWidth = screenWidth * 0.3;
        const buttonHeight = screenHeight * 0.07;
        const buttonSpacing = screenHeight * 0.02;
        const fontSize = Math.max(screenWidth * 0.02, 16);

        const style = new PIXI.TextStyle({
            fill: 'white',
            fontSize: fontSize,
            fontFamily: 'Arial',
        });

        this.title = new PIXI.Text('Game Developer Assignment', style);
        this. title.x = screenWidth / 2 - this.title.width / 2;
        this.title.y = screenHeight * 0.1;
        this.menuContainer.addChild(this.title);

        const options = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        options.forEach((option, index) => {
            const buttonContainer = new PIXI.Container();

            const box = new PIXI.Graphics();
            box.lineStyle(2, 0xFF0000);
            box.beginFill(0x000000);
            box.drawRect(0, 0, buttonWidth, buttonHeight);
            box.endFill();
            
            buttonContainer.interactive = true;
            (buttonContainer as any).buttonMode = true;
            buttonContainer.hitArea = new PIXI.Rectangle(0, 0, buttonWidth, buttonHeight);

            buttonContainer.on('pointerover', () => {
                box.clear();
                box.lineStyle(2, 0xFFA500);
                box.beginFill(0x000000);
                box.drawRect(0, 0, buttonWidth, buttonHeight);
                box.endFill();
            });
            buttonContainer.on('pointerout', () => {
                box.clear();
                box.lineStyle(2, 0xFF0000);
                box.beginFill(0x000000);
                box.drawRect(0, 0, buttonWidth, buttonHeight);
                box.endFill();
            });

            buttonContainer.on('pointerdown', () => {
                if (!this.isRepositioned) {
                    this.repositionMenu();
                    this.isRepositioned = true;
                }
                this.selectOption(index);
            });

            const buttonText = new PIXI.Text(option, style);
            buttonText.anchor.set(0.5);
            buttonText.x = buttonWidth / 2;
            buttonText.y = buttonHeight / 2;

            buttonContainer.addChild(box);
            buttonContainer.addChild(buttonText);

            buttonContainer.x = (screenWidth - buttonWidth) / 2;
            buttonContainer.y = screenHeight * 0.2 + index * (buttonHeight + buttonSpacing);

            this.buttons.push(buttonContainer);
            this.menuContainer.addChild(buttonContainer);
        });
    }

    private repositionMenu() {
        this.buttons.forEach((button, index) => {
            button.x = this.app.screen.width * 0.02;
            button.y = this.app.screen.height * 0.1 + index * (this.app.screen.height * 0.1);
            button.width = button.width * 0.8;
        });
        this.menuContainer.scale.set(0.7);
    }

    private selectOption(index: number) {
        this.title.visible = false;
    
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
