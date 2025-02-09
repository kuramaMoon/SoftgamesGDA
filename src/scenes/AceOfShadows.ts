// aceOfShadows.ts
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class AceOfShadows {
    private app: PIXI.Application;
    private stacks: PIXI.Graphics[][]; // Array of stacks, each containing 12 cards

    constructor(app: PIXI.Application) {
        this.app = app;
        this.stacks = [];

        // Set a dark background for better contrast
        this.app.renderer.background.color = 0x000000; // Black background

        this.initStacks();
        this.animateCards();
    }

    private initStacks() {
        const numStacks = 12; // Number of stacks
        const cardsPerStack = 12; // Number of cards per stack

        // Make card sizes responsive based on screen dimensions
        const cardWidth = Math.min(100, this.app.screen.width * 0.08); // Adjusted width
        const cardHeight = Math.min(150, this.app.screen.height * 0.15); // Adjusted height

        // Set the padding to prevent stacks from spawning outside the screen
        const padding = 20;
        const maxX = this.app.screen.width - cardWidth - padding;
        const maxY = this.app.screen.height - cardHeight - padding;

        for (let i = 0; i < numStacks; i++) {
            // Randomize stack positions within the screen bounds
            const stackPosition = {
                x: Math.random() * maxX + padding, // Random X within screen bounds
                y: Math.random() * maxY + padding, // Random Y within screen bounds
            };

            const stack: PIXI.Graphics[] = [];
            for (let j = 0; j < cardsPerStack; j++) {
                const card = new PIXI.Graphics();

                // Set the border style
                card.lineStyle(2, 0xFFFFFF, 1); // White border with thickness 2

                // Use vibrant colors for the cards
                const color = this.getRandomCardColor();
                card.beginFill(color);
                card.drawRect(0, 0, cardWidth, cardHeight);
                card.endFill();

                // Position the cards in the stack with overlap
                card.x = stackPosition.x;
                card.y = stackPosition.y + j * (cardHeight * 0.6); // Overlap cards slightly
                card.scale.set(1);

                this.app.stage.addChild(card);
                stack.push(card);
            }
            this.stacks.push(stack);
        }
    }

    private animateCards() {
        setInterval(() => {
            // Randomly select a source stack
            const sourceIndex = Math.floor(Math.random() * this.stacks.length);
            const sourceStack = this.stacks[sourceIndex];
            if (sourceStack.length === 0) return; // Skip if the stack is empty

            // Remove the top card from the source stack
            const card = sourceStack.pop();
            if (!card) return;

            // Randomly select a target stack (not the same as the source stack)
            let targetIndex = Math.floor(Math.random() * this.stacks.length);
            while (targetIndex === sourceIndex) {
                targetIndex = Math.floor(Math.random() * this.stacks.length);
            }
            const targetStack = this.stacks[targetIndex];

            // Calculate the target position
            const targetPosition = {
                x: this.stacks[targetIndex][0].x,
                y: this.stacks[targetIndex][0].y + targetStack.length * (card.height * 0.6),
            };

            // Animate the card moving to the target stack
            gsap.to(card, {
                duration: 2, // Animation takes 2 seconds
                x: targetPosition.x,
                y: targetPosition.y,
                ease: 'power1.inOut',
                onComplete: () => {
                    targetStack.push(card); // Add the card to the target stack
                },
            });
        }, 1000); // Move a card every second
    }

    private getRandomCardColor(): number {
        const colors = [
            0xFF4500, // Orange-Red
            0xFFA500, // Orange
            0xFFD700, // Gold
            0xFFFF00, // Yellow
            0xFFFFFF, // White
            0xFF8000, // Indian Red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
