import * as PIXI from 'pixi.js';

export class PhoenixFlame {
    private static instance: PhoenixFlame | null = null;
    private static textures: PIXI.Texture[] = []; 

    private app: PIXI.Application;
    private container: PIXI.Container; 
    private animatedFires: PIXI.AnimatedSprite[];
    private fireCircles: PIXI.Graphics[]; 
    private maxAnimatedFires: number = 5; 
    private maxFireCircles: number = 5; 
    private tickerListener!: () => void; 

    constructor(app: PIXI.Application) {
        if (PhoenixFlame.instance) {
            PhoenixFlame.instance.destroy(); 
        }
        PhoenixFlame.instance = this; 

        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.animatedFires = [];
        this.fireCircles = [];

        this.app.renderer.background.color = 0x000000;

        this.loadFireSprite(); 
    }

    private async loadFireSprite() {
        try {
            if (PhoenixFlame.textures.length > 0) {
                this.initAnimatedFires();
                this.initFireCircles();
                this.animateParticles();
                return;
            }

            const fireSpriteSheet = await PIXI.Assets.load('../public/sprites/fireSprite01.json');
            if (!fireSpriteSheet || !fireSpriteSheet.textures) {
                console.error('Failed to load fireSprite01.json');
                return;
            }

            PhoenixFlame.textures = Object.values(fireSpriteSheet.textures);

            this.initAnimatedFires();
            this.initFireCircles();
            this.animateParticles();
        } catch (error) {
            console.error('Error loading sprite sheet:', error);
        }
    }

    private initAnimatedFires() {
        const positions = [
            { x: this.app.screen.width * 0.30, y: this.app.screen.height - 260 }, 
            { x: this.app.screen.width * 0.70, y: this.app.screen.height - 260 },
            { x: this.app.screen.width * 0.4, y: this.app.screen.height - 260 }, 
            { x: this.app.screen.width * 0.6, y: this.app.screen.height - 260 },  
        ];

        for (let i = 0; i < this.maxAnimatedFires; i++) {
            const particle = new PIXI.AnimatedSprite(PhoenixFlame.textures);

            particle.animationSpeed = 0.1; 
            particle.play(); 

            particle.x = positions[i].x;
            particle.y = positions[i].y;
            particle.alpha = 1;
            particle.scale.set(1);

            this.container.addChild(particle);
            this.animatedFires.push(particle);
        }
    }

    private initFireCircles() {
        for (let i = 0; i < this.maxFireCircles; i++) {
            const particle = new PIXI.Graphics();

            const radius = 10 + Math.random() * 15; 
            particle.beginFill(this.getRandomFireColor());
            particle.drawCircle(0, 0, radius); 
            particle.endFill();

            const screenWidth = this.app.screen.width;
            const spawnX = this.getFireLikeSpawnPosition(screenWidth);

            particle.x = spawnX;
            particle.y = this.app.screen.height - 250; 
            particle.alpha = 1; 
            particle.scale.set(1); 

            this.container.addChild(particle);
            this.fireCircles.push(particle);
        }
    }

    private animateParticles() {
        this.tickerListener = () => {
            this.fireCircles.forEach((particle) => {
                particle.y -= Math.random() * 5 + 2; 
                particle.x += (Math.random() - 0.5) * 4; 

                particle.alpha -= 0.01;
                particle.scale.set(particle.scale.x * 0.98);

                if (particle.alpha <= 0 || particle.y < 0) {
                    particle.y = this.app.screen.height - 250; 
                    particle.x = this.getFireLikeSpawnPosition(this.app.screen.width);
                    particle.alpha = 1;
                    particle.scale.set(1); 
                    particle.clear(); 
                    const radius = 10 + Math.random() * 15;
                    particle.beginFill(this.getRandomFireColor());
                    particle.drawCircle(0, 0, radius); 
                    particle.endFill();
                }
            });
        };

        this.app.ticker.add(this.tickerListener);
    }

    private getFireLikeSpawnPosition(screenWidth: number): number {
        const center = screenWidth / 2;
        const spread = screenWidth / 3.75;
        const random1 = Math.random();
        const random2 = Math.random();
        const offset = (random1 + random2 - 1) * spread;
        return Math.max(0, Math.min(screenWidth, center + offset));
    }

    private getRandomFireColor(): number {
        const colors = [
            0xFF4500, 
            0xFFA500, 
            0xFFD700, 
            0xFFFF00, 
            0xFFFFFF, 
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    public destroy() {
        if (this.tickerListener) {
            this.app.ticker.remove(this.tickerListener);
        }

        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });

        this.animatedFires = [];
        this.fireCircles = [];

        PhoenixFlame.instance = null; 
    }
}