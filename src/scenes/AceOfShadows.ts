import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class AceOfShadows {
    private app: PIXI.Application;
    private container: PIXI.Container;
    private stacks: { cards: PIXI.Graphics[]; locked: boolean }[]; 
    private tickerListener!: () => void;
    private activeTweens: gsap.core.Tween[] = []; 
    private animationInterval: number = 100;
    private lastAnimationTime: number = 0; 

    constructor(app: PIXI.Application) {
        this.app = app;
        this.stacks = [];
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container); 

        this.app.renderer.background.color = 0x000000; 
        this.initStacks();
        this.animateCards();
    }

    private initStacks() {
        const numStacks = 12; 
        const cardsPerStack = 12; 

        const cardWidth = Math.min(100, this.app.screen.width * 0.08); 
        const cardHeight = Math.min(150, this.app.screen.height * 0.15); 

        const gapBetweenStacks = 20;

        const totalWidth = numStacks * cardWidth + (numStacks - 1) * gapBetweenStacks;

        const startX = (this.app.screen.width - totalWidth) / 2;
        const startY = (this.app.screen.height - cardHeight) / 2;

        for (let i = 0; i < numStacks; i++) {
            const stackX = startX + i * (cardWidth + gapBetweenStacks);

            const stack: PIXI.Graphics[] = [];
            for (let j = 0; j < cardsPerStack; j++) {
                const card = new PIXI.Graphics();

                card.lineStyle(2, 0x686868, 1); 
                const color = this.getRandomCardColor();
                card.beginFill(color);
                card.drawRect(0, 0, cardWidth, cardHeight);
                card.endFill();

                const overlapFactor = 0.1; 
                card.x = stackX;
                card.y = startY + j * (cardHeight * overlapFactor);
                card.scale.set(1);

                this.container.addChild(card);
                stack.push(card);

            }
            this.stacks.push({ cards: stack, locked: false });
        }
    }

    private animateCards() {
        this.tickerListener = () => {
            const now = Date.now();
    
            if (now - this.lastAnimationTime < this.animationInterval) return;
            this.lastAnimationTime = now;
    
            let sourceIndex = Math.floor(Math.random() * this.stacks.length);
            while (this.stacks[sourceIndex].locked || this.stacks[sourceIndex].cards.length === 0) {
                sourceIndex = Math.floor(Math.random() * this.stacks.length);
            }
            const sourceStack = this.stacks[sourceIndex];
    
            const card = sourceStack.cards.pop();
            if (!card) return;
    
            let targetIndex = Math.floor(Math.random() * this.stacks.length);
            while (targetIndex === sourceIndex || this.stacks[targetIndex].locked) {
                targetIndex = Math.floor(Math.random() * this.stacks.length);
            }
            const targetStack = this.stacks[targetIndex];
    
            targetStack.locked = true;
    
            const overlapFactor = 0.1;
            const targetPosition = {
                x: targetStack.cards.length > 0
                    ? targetStack.cards[0].x 
                    : card.x,
                y: targetStack.cards.length > 0
                    ? targetStack.cards[0].y + targetStack.cards.length * (card.height * overlapFactor) 
                    : card.y, 
            };
    
            const tween = gsap.to(card, {
                duration: 0.1,
                x: targetPosition.x,
                y: targetPosition.y,
                ease: 'power1.inOut',
                onStart: () => {
                    this.container.addChild(card);
                },
                onComplete: () => {
                    targetStack.cards.push(card);
                    targetStack.locked = false;
    
                    const index = this.activeTweens.indexOf(tween);
                    if (index !== -1) {
                        this.activeTweens.splice(index, 1);
                    }
                },
            });
    
            this.activeTweens.push(tween);
        };
    
        this.app.ticker.add(this.tickerListener);
    }

    public destroy() {

        if (this.tickerListener) {
            this.app.ticker.remove(this.tickerListener);
        }

        this.activeTweens.forEach((tween) => tween.kill());
        this.activeTweens = [];
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
        this.stacks = [];
    }

    private getRandomCardColor(): number {
        const colors = [
            0xFF4500, 
            0xFFA500, 
            0xFFD700,
            0xFFFF00, 
            0xFFFFFF,
            0xFF8000, 
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}