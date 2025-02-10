// MagicWords.ts
import * as PIXI from 'pixi.js';

export class MagicWords {
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.fetchDialogue();
    }

    private async fetchDialogue() {
        try {
            // Fetch data from the API
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();
    
            // Log the API response for debugging
            console.log('API Response:', data);
    
            // Render the dialogue
            this.renderDialogue(data.dialogue);
        } catch (error) {
            console.error('Error fetching dialogue:', error);
        }
    }

    private renderDialogue(dialogue: { name?: string; text: string; }[]) {
        // Clear the stage before rendering new content
        this.app.stage.removeChildren();
    
        // Set up a container for the dialogue
        const dialogueContainer = new PIXI.Container();
        this.app.stage.addChild(dialogueContainer);
    
        // Responsive layout settings
        const padding = 20;
        const maxWidth = this.app.screen.width - 2 * padding;
        const fontSize = Math.min(24, this.app.screen.width * 0.03); // Responsive font size
    
        let yOffset = padding; // Vertical offset for rendering lines
    
        dialogue.forEach((line, index) => {
            const { name, text } = line;
    
            // Validate the character field
            const characterName = name && name.trim() !== "" ? name : "Unknown";
    
            // Create a container for the current line
            const lineContainer = new PIXI.Container();
            lineContainer.y = yOffset;
    
            // Render the character name
            const characterText = new PIXI.Text(`${characterName}: `, {
                fontFamily: 'Arial',
                fontSize,
                fill: 0xffffff, // White color
                fontWeight: 'bold',
            });
            lineContainer.addChild(characterText);
    
            // Parse and render the dialogue text with emojis
            const { textParts, emojiUrls } = this.parseTextWithEmojis(text, fontSize);
            let xOffset = characterText.width; // Start text after the character name
    
            textParts.forEach((part, i) => {
                if (part.text) {
                    // Render text part
                    const dialogueText = new PIXI.Text(part.text, {
                        fontFamily: 'Arial',
                        fontSize,
                        fill: 0xffffff, // White color
                    });
                    dialogueText.x = xOffset;
                    lineContainer.addChild(dialogueText);
                    xOffset += dialogueText.width;
                }
    
                if (emojiUrls[i]) {
                    // Load and render emoji image (only if the URL is not null)
                    this.loadEmoji(emojiUrls[i], fontSize).then((sprite) => {
                        if (sprite) {
                            sprite.x = xOffset;
                            sprite.y = (fontSize - sprite.height * sprite.scale.y) / 2; // Center vertically
                            lineContainer.addChild(sprite);
                        }
                    });
                    xOffset += fontSize + 5; // Add space for the emoji
                }
            });
    
            // Add the line container to the dialogue container
            dialogueContainer.addChild(lineContainer);
    
            // Update the vertical offset for the next line
            yOffset += fontSize + padding;
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
    
        // Split the text by emoji placeholders
        const parts = text.split(/(\{[^}]+\})/);
        parts.forEach((part) => {
            if (part.startsWith('{') && part.endsWith('}')) {
                // Emoji placeholder
                const emojiUrl = emojiMap[part];
                if (emojiUrl) {
                    textParts.push({ text: '' }); // Empty text part for the emoji
                    emojiUrls.push(emojiUrl);
                } else {
                    textParts.push({ text: part }); // Treat unknown placeholders as regular text
                    emojiUrls.push(null);
                }
            } else {
                // Regular text
                textParts.push({ text: part });
                emojiUrls.push(null); // No emoji for this part
            }
        });
    
        return { textParts, emojiUrls };
    }

    private async loadEmoji(url: string, fontSize: number): Promise<PIXI.Sprite | null> {
        try {
            const texture = await PIXI.Assets.load(url);
            const sprite = new PIXI.Sprite(texture);
            sprite.scale.set(fontSize / sprite.height); // Scale emoji to match font size
            return sprite;
        } catch (error) {
            console.error(`Error loading emoji from ${url}:`, error);
            return null; // Return null if the emoji fails to load
        }
    }
}