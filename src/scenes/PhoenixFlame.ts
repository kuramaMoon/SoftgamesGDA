// // phoenixFlame.ts
// import * as PIXI from 'pixi.js';

// export class PhoenixFlame {
//     private app: PIXI.Application;
//     private particles: PIXI.Graphics[];
//     private maxParticles: number;
//     private particleCreationInterval: number;

//     constructor(app: PIXI.Application) {
//         this.app = app;
//         this.particles = [];
//         this.maxParticles = 1000; // Maximum number of particles
//         this.particleCreationInterval = 10; // Time between particle creations (in milliseconds)

//         // Set a dark background for better contrast
//         this.app.renderer.background.color = 0x000000; // Black background

//         this.initParticlesGradually();
//         this.animateParticles();
//     }

//     private initParticlesGradually() {
//         let particleCount = 0;

//         const createParticle = () => {
//             if (particleCount >= this.maxParticles) return;

//             const particle = new PIXI.Graphics();

//             // Draw a circle with a random fire color
//             const radius = 15 + Math.random() * 50; // Random radius between 10 and 25
//             particle.beginFill(this.getRandomFireColor());
//             particle.drawCircle(0, 0, radius); // Draw a circle
//             particle.endFill();

//             // Position the particle using fire-like spawn logic
//             const screenWidth = this.app.screen.width;
//             const spawnX = this.getFireLikeSpawnPosition(screenWidth);

//             particle.x = spawnX;
//             particle.y = this.app.screen.height;

//             particle.alpha = 1; // Fully visible initially
//             particle.scale.set(1); // Initial scale

//             this.app.stage.addChild(particle);
//             this.particles.push(particle);

//             particleCount++;

//             // Schedule the next particle creation
//             if (particleCount < this.maxParticles) {
//                 setTimeout(createParticle, this.particleCreationInterval);
//             }
//         };

//         // Start creating particles
//         createParticle();
//     }

//     private getFireLikeSpawnPosition(screenWidth: number): number {
//         // Use a triangular distribution centered around the middle of the screen
//         const center = screenWidth / 2;
//         const spread = screenWidth / 2 ; // Controls how wide the distribution is

//         // Generate two random numbers and take their average to favor the center
//         const random1 = Math.random();
//         const random2 = Math.random();
//         const offset = (random1 + random2 - 1) * spread;

//         // Calculate the final position
//         const position = center + offset;

//         // Clamp the position to stay within screen bounds
//         return Math.max(0, Math.min(screenWidth, position));
//     }

//     private animateParticles() {
//         this.app.ticker.add(() => {
//             this.particles.forEach((particle) => {
//                 // Move the particle upward with slight randomness
//                 particle.y -= Math.random() * 5 + 2; // Base speed + randomness
//                 particle.x += (Math.random() - 0.5) * 4; // Horizontal jitter

//                 // Fade out and shrink the particle
//                 particle.alpha -= 0.01;
//                 particle.scale.set(particle.scale.x * 0.98);

//                 // Reset the particle when it fades out or moves off-screen
//                 if (particle.alpha <= 0 || particle.y < 0) {
//                     particle.y = this.app.screen.height; // Reset to the bottom
//                     particle.x = this.getFireLikeSpawnPosition(this.app.screen.width); // Fire-like spawn
//                     particle.alpha = 1; // Reset opacity
//                     particle.scale.set(1); // Reset scale
//                     particle.clear(); // Clear previous graphics
//                     const radius = 10 + Math.random() * 15; // Random radius
//                     particle.beginFill(this.getRandomFireColor());
//                     particle.drawCircle(0, 0, radius); // Redraw the circle
//                     particle.endFill();
//                 }
//             });
//         });
//     }

//     private getRandomFireColor(): number {
//         const colors = [
//             0xFF4500, // Orange-Red
//             0xFFA500, // Orange
//             0xFFD700, // Gold
//             0xFFFF00, // Yellow
//             0xFFFFFF, // White
//         ];
//         return colors[Math.floor(Math.random() * colors.length)];
//     }
// }

// phoenixFlame.ts
import * as PIXI from 'pixi.js';

export class PhoenixFlame {
    private app: PIXI.Application;
    private particles: PIXI.AnimatedSprite[];
    private maxParticles: number;
    private particleCreationInterval: number;
    private textures: PIXI.Texture[] = []; // Store preloaded textures

    constructor(app: PIXI.Application) {
        this.app = app;
        this.particles = [];
        this.maxParticles = 1;
        this.particleCreationInterval = 500;

        this.app.renderer.background.color = 0x000000;

        this.loadFireSprite(); // Load the sprite sheet
    }

    private async loadFireSprite() {
        try {
            // Load the sprite sheet using PIXI v7 Assets API
            const spriteSheet = await PIXI.Assets.load('../public/sprites/fireSprite.json');

            if (!spriteSheet || !spriteSheet.textures) {
                console.error('Failed to load fireSprite.json');
                return;
            }

            this.textures = Object.values(spriteSheet.textures);

            if (this.textures.length === 0) {
                console.error('No frames found in fireSprite.json');
                return;
            }

            // Once loaded, initialize particles
            this.initParticlesGradually();
            this.animateParticles();
        } catch (error) {
            console.error('Error loading sprite sheet:', error);
        }
    }

    private initParticlesGradually() {
        let particleCount = 0;

        const createParticle = () => {
            if (particleCount >= this.maxParticles) return;
            if (this.textures.length === 0) return;

            const particle = new PIXI.AnimatedSprite(this.textures);
            particle.animationSpeed = 0.1;
            particle.play();

            const spawnX = this.getFireLikeSpawnPosition(this.app.screen.width);
            particle.x = this.app.screen.height / 2;
            particle.y = this.app.screen.height-170;

            particle.alpha = 1;
            particle.scale.set(1);

            this.app.stage.addChild(particle);
            this.particles.push(particle);

            particleCount++;

            if (particleCount < this.maxParticles) {
                setTimeout(createParticle, this.particleCreationInterval);
            }
        };

        createParticle();
    }

    private getFireLikeSpawnPosition(screenWidth: number): number {
        const center = screenWidth / 2;
        const spread = screenWidth / 4;
        const random1 = Math.random();
        const random2 = Math.random();
        const offset = (random1 + random2 - 1) * spread;
        return Math.max(0, Math.min(screenWidth, center + offset));
    }

    private animateParticles() {
        this.app.ticker.add(() => {
            this.particles.forEach((particle) => {
                
            });
        });
    }
}
