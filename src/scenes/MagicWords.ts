import * as PIXI from 'pixi.js';

export class MagicWords {
    private app: PIXI.Application;
    private container: PIXI.Container; 
    private dialogueContainer: PIXI.Container; 
    private choicesContainer: PIXI.Container; 

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.dialogueContainer = new PIXI.Container();
        this.choicesContainer = new PIXI.Container();

        this.container.addChild(this.dialogueContainer);
        this.container.addChild(this.choicesContainer);

        this.app.stage.addChild(this.container);

        this.fetchDialogue();
    }

    private async fetchDialogue() {
        try {
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();

            this.renderDialogue(data.dialogue || []); 
            this.renderChoices(data.choices || []);
        } catch (error) {
            console.error('Error fetching dialogue:', error);
        }
    }

    private renderDialogue(dialogue: { name?: string; text: string; }[]) {
        this.dialogueContainer.removeChildren();

        const padding = 20;
        const maxWidth = this.app.screen.width * 0.6; 
        const fontSize = Math.min(24, this.app.screen.width * 0.03);
        let yOffset = padding; 

        dialogue.forEach((line, index) => {
            const { name, text } = line;

            const characterName = name && name.trim() !== "" ? name : "Unknown";

            const lineContainer = new PIXI.Container();
            lineContainer.y = yOffset;

            const characterText = new PIXI.Text(`${characterName}: `, {
                fontFamily: 'Arial',
                fontSize,
                fill: 0xffffff, 
                fontWeight: 'bold',
            });
            lineContainer.addChild(characterText);

            const { textParts, emojiUrls } = this.parseTextWithEmojis(text, fontSize);
            let xOffset = characterText.width; 

            textParts.forEach((part, i) => {
                if (part.text) {
                    const dialogueText = new PIXI.Text(part.text, {
                        fontFamily: 'Arial',
                        fontSize,
                        fill: 0xffffff,
                    });
                    dialogueText.x = xOffset;
                    lineContainer.addChild(dialogueText);
                    xOffset += dialogueText.width;
                }

                if (emojiUrls[i]) {
                    this.loadEmoji(emojiUrls[i], fontSize).then((sprite) => {
                        if (sprite) {
                            sprite.x = xOffset;
                            sprite.y = (fontSize - sprite.height * sprite.scale.y) / 2; 
                            lineContainer.addChild(sprite);
                        }
                    });
                    xOffset += fontSize + 5; 
                }
            });

            this.dialogueContainer.addChild(lineContainer);
            yOffset += fontSize + padding;
        });

        this.dialogueContainer.x = (this.app.screen.width - maxWidth) / 2;
    }

    private renderChoices(choices: string[]) {
        this.choicesContainer.removeChildren();

        const padding = 20;
        const buttonWidth = 200; 
        const buttonHeight = 50; 
        const fontSize = Math.min(24, this.app.screen.width * 0.03); 

        let yOffset = padding; 

        if (!Array.isArray(choices)) {
            console.error('Choices is not an array:', choices);
            return;
        }

        choices.forEach((choice, index) => {
            const buttonContainer = new PIXI.Container();

            const buttonBackground = new PIXI.Graphics();
            buttonBackground.beginFill(0x000000); 
            buttonBackground.drawRect(0, 0, buttonWidth, buttonHeight);
            buttonBackground.endFill();
            buttonBackground.lineStyle(2, 0xFFFFFF); 
            buttonBackground.drawRect(0, 0, buttonWidth, buttonHeight);

            buttonContainer.addChild(buttonBackground);

            const buttonText = new PIXI.Text(choice, {
                fontFamily: 'Arial',
                fontSize,
                fill: 0xFFFFFF, 
                align: 'center',
            });
            buttonText.anchor.set(0.5); 
            buttonText.x = buttonWidth / 2;
            buttonText.y = buttonHeight / 2;

            buttonContainer.addChild(buttonText);

            buttonContainer.x = padding; 
            buttonContainer.y = yOffset;

            buttonContainer.interactive = true;
            (buttonContainer as any).buttonMode = true;
            buttonContainer.on('pointerdown', () => {
                console.log(`Choice selected: ${choice}`);

            });

            this.choicesContainer.addChild(buttonContainer);
            yOffset += buttonHeight + padding;
        });
    }

    private parseTextWithEmojis(text: string, fontSize: number): { textParts: { text: string }[], emojiUrls: (string | null)[] } {
        const emojiMap: { [key: string]: string } = {
            '{satisfied}': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f60a.svg',
            '{intrigued}': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f914.svg',
            '{neutral}': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f610.svg',
            '{laughing}': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f602.svg',
            '{win}': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f389.svg',
        };

        const textParts: { text: string }[] = [];
        const emojiUrls: (string | null)[] = [];

        const parts = text.split(/(\{[^}]+\})/);
        parts.forEach((part) => {
            if (part.startsWith('{') && part.endsWith('}')) {
                const emojiUrl = emojiMap[part];
                if (emojiUrl) {
                    textParts.push({ text: '' }); 
                    emojiUrls.push(emojiUrl);
                } else {
                    textParts.push({ text: part }); 
                    emojiUrls.push(null);
                }
            } else {
                textParts.push({ text: part });
                emojiUrls.push(null);
            }
        });

        return { textParts, emojiUrls };
    }

    private async loadEmoji(url: string, fontSize: number): Promise<PIXI.Sprite | null> {
        try {
            const texture = await PIXI.Assets.load(url);
            const sprite = new PIXI.Sprite(texture);
            sprite.scale.set(fontSize / sprite.height);
            return sprite;
        } catch (error) {
            console.error(`Error loading emoji from ${url}:`, error);
            return null;
        }
    }

    public destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
}