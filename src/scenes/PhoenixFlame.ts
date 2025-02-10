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
    private animatedFires: PIXI.AnimatedSprite[]; // Animated fire sprites
    private fireCircles: PIXI.Graphics[]; // Fire circles
    private maxAnimatedFires: number = 5; // Maximum animated fire sprites
    private maxFireCircles: number = 5; // Maximum fire circles
    private textures: PIXI.Texture[] = []; // Store preloaded textures

    constructor(app: PIXI.Application) {
        this.app = app;
        this.animatedFires = [];
        this.fireCircles = [];

        // Set a dark background for better contrast
        this.app.renderer.background.color = 0x000000;

        this.loadFireSprite(); // Load the sprite sheet
    }

    private async loadFireSprite() {
        try {
            // Load the sprite sheet using PIXI v7 Assets API
            const fireSpriteSheet = await PIXI.Assets.load('../public/sprites/fireSprite01.json');
            if (!fireSpriteSheet || !fireSpriteSheet.textures) {
                console.error('Failed to load fireSprite01.json');
                return;
            }
            this.textures = Object.values(fireSpriteSheet.textures);

            // Initialize animated fires and fire circles
            this.initAnimatedFires();
            this.initFireCircles();
            this.animateParticles();
        } catch (error) {
            console.error('Error loading sprite sheet:', error);
        }
    }

    private initAnimatedFires() {
        const positions = [
            { x: this.app.screen.width * 0.30, y: this.app.screen.height - 260 }, // Left
            { x: this.app.screen.width * 0.70, y: this.app.screen.height - 260 }, // Right
            { x: this.app.screen.width * 0.4, y: this.app.screen.height - 260 },  // Middle-left
            { x: this.app.screen.width * 0.6, y: this.app.screen.height - 260 },  // Middle-right
            { x: this.app.screen.width * 0.5, y: this.app.screen.height - 260 },  // Center
        ];

        for (let i = 0; i < this.maxAnimatedFires; i++) {
            const particle = new PIXI.AnimatedSprite(this.textures);

            // Configure animation
            particle.animationSpeed = 0.1; // Adjust speed
            particle.play(); // Start the animation

            // Position the particle
            particle.x = positions[i].x;
            particle.y = positions[i].y;
            particle.alpha = 1;
            particle.scale.set(1);

            // Add to stage and particles array
            this.app.stage.addChild(particle);
        }
    }

    private initFireCircles() {
        for (let i = 0; i < this.maxFireCircles; i++) {
            const particle = new PIXI.Graphics();

            // Draw a circle with a random fire color
            const radius = 10 + Math.random() * 15; // Random radius between 10 and 25
            particle.beginFill(this.getRandomFireColor());
            particle.drawCircle(0, 0, radius); // Draw a circle
            particle.endFill();

            // Position the particle using fire-like spawn logic
            const screenWidth = this.app.screen.width;
            const spawnX = this.getFireLikeSpawnPosition(screenWidth);

            particle.x = spawnX;
            particle.y = this.app.screen.height - 250; // Positioned below the animated fires
            particle.alpha = 1; // Fully visible initially
            particle.scale.set(1); // Initial scale

            this.app.stage.addChild(particle);
            this.fireCircles.push(particle);
        }
    }

    private animateParticles() {
        this.app.ticker.add(() => {
            // Animate animated fires
            this.animatedFires.forEach((particle) => {
                // Slight vertical jitter
                particle.y -= Math.random() * 2;
                particle.x += (Math.random() - 0.5) * 2;

                // Reset position if it moves too far
                if (particle.y < this.app.screen.height - 280) {
                    particle.y = this.app.screen.height - 250;
                }
            });

            // Animate fire circles
            this.fireCircles.forEach((particle) => {
                // Move the particle upward with slight randomness
                particle.y -= Math.random() * 5 + 2; // Base speed + randomness
                particle.x += (Math.random() - 0.5) * 4; // Horizontal jitter

                // Fade out and shrink the particle
                particle.alpha -= 0.01;
                particle.scale.set(particle.scale.x * 0.98);

                // Reset the particle when it fades out or moves off-screen
                if (particle.alpha <= 0 || particle.y < 0) {
                    particle.y = this.app.screen.height - 250; // Reset to the bottom
                    particle.x = this.getFireLikeSpawnPosition(this.app.screen.width); // Fire-like spawn
                    particle.alpha = 1; // Reset opacity
                    particle.scale.set(1); // Reset scale
                    particle.clear(); // Clear previous graphics
                    const radius = 10 + Math.random() * 15; // Random radius
                    particle.beginFill(this.getRandomFireColor());
                    particle.drawCircle(0, 0, radius); // Redraw the circle
                    particle.endFill();
                }
            });
        });
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
            0xFF4500, // Orange-Red
            0xFFA500, // Orange
            0xFFD700, // Gold
            0xFFFF00, // Yellow
            0xFFFFFF, // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}