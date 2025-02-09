// magicWords.ts
import * as PIXI from 'pixi.js';
import axios from 'axios';

export class MagicWords {
    private app: PIXI.Application;
    private dialogues: string[];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.dialogues = [];

        this.fetchDialogues();
    }

    private async fetchDialogues() {
        try {
            const response = await axios.get(
                'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords'
            );
            this.dialogues = response.data.map((dialogue: any) => dialogue.text);

            this.renderDialogue();
        } catch (error) {
            console.error('Error fetching dialogues:', error);
        }
    }

    private renderDialogue() {
        const style = new PIXI.TextStyle({
            fill: 'white',
            fontSize: 24,
            fontFamily: 'Arial',
        });

        this.dialogues.forEach((text, index) => {
            const dialogueText = new PIXI.Text(text, style);
            dialogueText.x = 50;
            dialogueText.y = 50 + index * 50;
            this.app.stage.addChild(dialogueText);
        });
    }
}