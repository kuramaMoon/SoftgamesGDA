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
            fill: 'white', // White text
            fontSize: 30, // Adjusted font size to fit inside the box
            fontFamily: 'Arial',
        });

        // Title
        const title = new PIXI.Text('Game Developer Assignment', style);
        title.x = this.app.screen.width / 2 - title.width / 2; // Center the title horizontally
        title.y = 50; // Adjusted position for better spacing
        this.menuContainer.addChild(title);

        // Options
        const options = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        options.forEach((option, index) => {
            const buttonContainer = new PIXI.Container();

            // Create a red-bordered box
            const box = new PIXI.Graphics();
            box.lineStyle(2, 0xFF0000); // Red border
            box.beginFill(0x000000); // Black background
            box.drawRect(0, 0, 400, 60); // Box dimensions
            box.endFill();
            box.x = this.app.screen.width / 2 - 200; // Center the box horizontally
            box.y = 150 + index * 80; // Vertical spacing

            // Enable interactivity
            buttonContainer.interactive = true;
            (buttonContainer as any).buttonMode = true;

            // Define a hit area for the buttonContainer
            buttonContainer.hitArea = new PIXI.Rectangle(
                box.x,
                box.y,
                400, // Width of the box
                60 // Height of the box
            );

            // Add hover effect
            buttonContainer.on('pointerover', () => {
                box.clear();
                box.lineStyle(2, 0xFFA500); // Orange border on hover
                box.beginFill(0x000000); // Black background
                box.drawRect(0, 0, 400, 60); // Redraw the box
                box.endFill();
            });
            buttonContainer.on('pointerout', () => {
                box.clear();
                box.lineStyle(2, 0xFF0000); // Red border on hover out
                box.beginFill(0x000000); // Black background
                box.drawRect(0, 0, 400, 60); // Redraw the box
                box.endFill();
            });

            // Add click event
            buttonContainer.on('pointerdown', () => {
                console.log(`Button clicked: ${option}`); // Debugging log
                this.repositionMenu(); // Move the menu to the top-left corner
                this.selectOption(index);
            });

            // Add text inside the box
            const buttonText = new PIXI.Text(option, style);
            buttonText.anchor.set(0.5); // Center the text relative to its position
            buttonText.x = box.x + 200; // Center horizontally within the box
            buttonText.y = box.y + 30; // Center vertically within the box

            // Add box and text to the container
            buttonContainer.addChild(box);
            buttonContainer.addChild(buttonText);
            this.menuContainer.addChild(buttonContainer);
        });
    }

    private repositionMenu() {
        // Set pivot to top-left corner for proper repositioning
        this.menuContainer.pivot.set(this.menuContainer.width / 2, 0);
        
        // Move the menu to the top-left corner below the FPS counter
        this.menuContainer.x = 0;
        this.menuContainer.y = 40;
        
        // Scale down for better visibility
        this.menuContainer.scale.set(0.7);
    }

    private selectOption(index: number) {
        // Clear previous game scenes, but preserve the menu and FPS counter
        this.app.stage.children.forEach((child) => {
            if (child !== this.menuContainer && !(child instanceof PIXI.Text)) {
                child.destroy();
            }
        });
    
        // Load the selected game scene dynamically
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