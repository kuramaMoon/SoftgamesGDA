import * as PIXI from 'pixi.js';

export class MagicWords {
    private app: PIXI.Application;
    private container: PIXI.Container;
    private dialogueContainer: PIXI.Container;
    private avatars: { [key: string]: { url: string; position: string } } = {};
    private emojiMap: { [key: string]: string } = {};
    private currentIndex = 0;
    private leftIndent = 0.2;
    private containerWidth = 0;
    private defaultAvatarUrl = './public/assets/images/avatar.png';
    private dialogueBoxHeight: number;
    private maxScrollY: number = 0;
    private scrollOffset: number = 0; // Track scroll offset for content scrolling


    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.dialogueContainer = new PIXI.Container();

        this.containerWidth = this.app.screen.width - (this.leftIndent * this.app.screen.width) - (this.app.screen.width * 0.25);
        this.dialogueBoxHeight = this.app.screen.height - 150;

        const dialogueBox = new PIXI.Graphics();
        dialogueBox.beginFill(0x222222, 0.8);
        dialogueBox.drawRoundedRect(this.leftIndent * this.app.screen.width, 50, this.containerWidth, this.dialogueBoxHeight, 20);
        dialogueBox.endFill();
        this.container.addChild(dialogueBox);

        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRoundedRect(this.leftIndent * this.app.screen.width, 50, this.containerWidth, this.dialogueBoxHeight, 20);
        mask.endFill();
        this.container.addChild(mask);
        this.dialogueContainer.mask = mask;

        this.dialogueContainer.y = 60; // Keep container fixed at y = 60
        this.container.addChild(this.dialogueContainer);
        this.app.stage.addChild(this.container);

        // Ensure dialogueContainer is fully interactive and hit-testable
        this.dialogueContainer.interactive = true;
        this.dialogueContainer.hitArea = new PIXI.Rectangle(
            this.leftIndent * this.app.screen.width,
            50,
            this.containerWidth,
            this.dialogueBoxHeight
        );

        this.setupScroll();
        this.fetchDialogue();
    }

    private setupScroll() {
        let isDragging = false;
        let startY = 0;
        let startScrollOffset = 0;

        console.log('Setting up scroll on dialogueContainer', {
            interactive: this.dialogueContainer.interactive,
            hitArea: this.dialogueContainer.hitArea,
            position: { x: this.dialogueContainer.x, y: this.dialogueContainer.y },
            children: this.dialogueContainer.children.length,
            maxScrollY: this.maxScrollY
        });

        this.dialogueContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
            console.log('Pointer down at', event.global.y);
            isDragging = true;
            startY = event.global.y;
            startScrollOffset = this.scrollOffset;
        });

        this.dialogueContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
            if (!isDragging) return;
            console.log('Pointer moving at', event.global.y);

            const currentY = event.global.y;
            const deltaY = currentY - startY;
            let newOffset = startScrollOffset + deltaY;

            newOffset = Math.min(0, newOffset); // Top bound (no scrolling above top)
            newOffset = Math.max(-this.maxScrollY, newOffset); // Bottom bound

            this.scrollOffset = newOffset;
            this.applyScrollOffset();
        });

        this.dialogueContainer.on('pointerup', (event: PIXI.FederatedPointerEvent) => {
            console.log('Pointer up at', event.global.y);
            isDragging = false;
        });

        this.dialogueContainer.on('pointerupoutside', (event: PIXI.FederatedPointerEvent) => {
            console.log('Pointer up outside at', event.global.y);
            isDragging = false;
        });

        // Improved mouse wheel scrolling, using PIXI.FederatedWheelEvent
        this.dialogueContainer.on('wheel', (event: PIXI.FederatedWheelEvent) => {
            console.log('Wheel event, deltaY:', event.deltaY, 'Global position:', event.global);
            event.stopPropagation(); // Prevent event bubbling if needed

            // Normalize deltaY for consistent scrolling across devices
            const normalizedDelta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 100);
            const scrollSpeed = 5; // Reduced for smoother scrolling
            let newOffset = this.scrollOffset - (normalizedDelta * scrollSpeed) / 10;

            // Constrain within bounds
            newOffset = Math.min(0, newOffset); // Top bound (no scrolling above top)
            newOffset = Math.max(-this.maxScrollY, newOffset); // Bottom bound

            this.scrollOffset = newOffset;
            this.applyScrollOffset();
        });

        // Add scrollbar
        this.setupScrollbar();
    }

    private setupScrollbar() {
        const scrollbarWidth = 10; // Width of the scrollbar
        const scrollbarHeight = this.dialogueBoxHeight - 20; // Height, accounting for padding
        const scrollbarX = this.leftIndent * this.app.screen.width + this.containerWidth + 5; // Positioned to the right of the chat
        const scrollbarY = 60; // Start at the top of the dialogue box

        // Create scrollbar background
        const scrollbarBg = new PIXI.Graphics();
        scrollbarBg.beginFill(0x666666, 0.5);
        scrollbarBg.drawRoundedRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 5);
        scrollbarBg.endFill();
        this.container.addChild(scrollbarBg);

        // Calculate handle size based on content height
        const contentHeight = this.dialogueContainer.height;
        const visibleHeight = this.dialogueBoxHeight;
        const handleHeight = Math.max(20, (visibleHeight / contentHeight) * scrollbarHeight); // Minimum 20px for usability
        const maxHandleY = scrollbarHeight - handleHeight;

        // Reassign scrollbarHandle (already initialized in constructor)

        let isDraggingHandle = false;
        let startHandleY = 0;
        let startScrollOffset = 0;


        // Attach scrollbar dragging to dialogueContainer for broader event coverage
        this.dialogueContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
            if (!isDraggingHandle) return;

            const currentY = event.global.y;
            const deltaY = currentY - (startHandleY - startScrollOffset); // Adjust for initial offset
            let newHandleY = startHandleY + deltaY;

            newHandleY = Math.max(scrollbarY, Math.min(scrollbarY + maxHandleY, newHandleY));


            // Map handle position to scrollOffset
            const scrollRatio = (newHandleY - scrollbarY) / maxHandleY;
            const scrollRange = this.maxScrollY;
            const newOffset = -(scrollRatio * scrollRange);

            this.scrollOffset = newOffset;
            this.applyScrollOffset();
        });

        this.dialogueContainer.on('pointerup', (event: PIXI.FederatedPointerEvent) => {
            if (isDraggingHandle) {
                console.log('Scrollbar handle released');
                isDraggingHandle = false;
            }
        });

        this.dialogueContainer.on('pointerupoutside', (event: PIXI.FederatedPointerEvent) => {
            if (isDraggingHandle) {
                console.log('Scrollbar handle released outside');
                isDraggingHandle = false;
            }
        });
    }

    private applyScrollOffset() {
        // Apply scroll offset to all children of dialogueContainer
        this.dialogueContainer.children.forEach((child) => {
            if (child instanceof PIXI.Container) {
                const initialY = (child as any).initialY || 0; // Use type assertion for initialY
                child.y = initialY + this.scrollOffset;
            }
        });
    }

    private updateScrollBounds() {
        const contentHeight = this.dialogueContainer.height;
        this.maxScrollY = Math.max(0, contentHeight - this.dialogueBoxHeight + 20);
        console.log('Max scroll Y:', this.maxScrollY, 'Content height:', contentHeight, 'Box height:', this.dialogueBoxHeight, 'Children:', this.dialogueContainer.children.length, 'Interactive:', this.dialogueContainer.interactive, 'Scroll offset:', this.scrollOffset);
        
        // Ensure dialogueContainer remains interactive after updates
        this.dialogueContainer.interactive = true;
        this.applyScrollOffset(); // Reapply scroll offset to update positions
    }

    private async fetchDialogue() {
        try {
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();
            console.log('Fetched dialogue data:', data);

            data.emojies.forEach((emoji: any) => {
                this.emojiMap[`{${emoji.name}}`] = emoji.url;
            });

            data.avatars.forEach((avatar: any) => {
                this.avatars[avatar.name] = { url: avatar.url, position: avatar.position };
            });

            this.displayDialogue(data.dialogue || []);
        } catch (error) {
            console.error('Error fetching dialogue:', error);
            // Fallback: Use dummy data for testing
            this.displayDialogue([
                { name: "TestUser", text: "Testing message 1 after API fail" },
                { name: "TestUser", text: "Testing message 2 after API fail" },
                { name: "TestUser", text: "Testing message 3 after API fail" }, // Add more for testing
            ]);
        }
    }

    private displayDialogue(dialogue: { name?: string; text: string }[]) {
        console.log('Displaying dialogue:', dialogue);
        this.dialogueContainer.removeChildren();
        this.currentIndex = 0;
        this.scrollOffset = 0; // Reset scroll offset when resetting dialogue
        this.updateScrollBounds(); // Recalculate bounds after resetting
        this.showNextMessage(dialogue);
    }

    private showNextMessage(dialogue: { name?: string; text: string }[]) {
        console.log('Current index:', this.currentIndex, 'Dialogue length:', dialogue.length);
        if (this.currentIndex >= dialogue.length) {
            this.updateScrollBounds();
            return;
        }

        const line = dialogue[this.currentIndex];
        this.currentIndex++;

        this.renderDialogueLine(line);

        setTimeout(() => {
            this.showNextMessage(dialogue);
        }, 1000); // Adjust timing if messages are skipped
    }

    private renderDialogueLine(line: { name?: string; text: string }) {
        console.log('Rendering line:', line, 'Current children count:', this.dialogueContainer.children.length);

        const { name, text } = line;
        const characterName = name || "Unknown";

        const avatarData = this.avatars[characterName] || { url: this.defaultAvatarUrl, position: 'right' };
        console.log(avatarData);
        const isLeft = avatarData.position === 'left';

        const TEXT_PADDING = this.app.screen.width * 0.008;
        const MAX_MESSAGE_WIDTH = this.containerWidth * 0.6;

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: this.app.screen.width * 0.015,
            fill: 0xffffff,
            wordWrap: true,
            wordWrapWidth: MAX_MESSAGE_WIDTH - TEXT_PADDING * 2,
        });

        const measuredText = PIXI.TextMetrics.measureText(text, textStyle);
        const MESSAGE_WIDTH = Math.min(measuredText.width, MAX_MESSAGE_WIDTH);
        const MESSAGE_HEIGHT = measuredText.height;

        const GAP_PERCENTAGE = 0.15; // Increased for more spacing, ensuring content grows
        const yOffset = this.dialogueContainer.children.length * (this.app.screen.height * GAP_PERCENTAGE);

        const messageContainer = new PIXI.Container() as any; // Use type assertion for initialY
        messageContainer.initialY = yOffset; // Store initial Y position for scrolling
        messageContainer.y = yOffset + this.scrollOffset; // Apply current scroll offset

        const avatarSprite = PIXI.Sprite.from(avatarData.url);
        avatarSprite.width = this.app.screen.width * 0.05;
        avatarSprite.height = this.app.screen.width * 0.05;

        if (isLeft) {
            avatarSprite.x = 0;
            messageContainer.x = this.leftIndent * this.app.screen.width;
        } else {
            avatarSprite.x = MESSAGE_WIDTH + avatarSprite.width;
            messageContainer.x = this.leftIndent * this.app.screen.width + this.containerWidth - MESSAGE_WIDTH - avatarSprite.width * 2 - TEXT_PADDING;
        }

        messageContainer.addChild(avatarSprite);

        const bubble = new PIXI.Graphics();
        bubble.beginFill(isLeft ? 0x1e88e5 : 0x555555, 1);
        bubble.interactive = true; // Ensure bubbles are interactive for event propagation

        if (isLeft) {
            bubble.drawRoundedRect(avatarSprite.width, 0, MESSAGE_WIDTH + TEXT_PADDING * 2, MESSAGE_HEIGHT + TEXT_PADDING * 2, 15);
        } else {
            bubble.drawRoundedRect(avatarSprite.width - TEXT_PADDING * 3, 0, MESSAGE_WIDTH + TEXT_PADDING * 2, MESSAGE_HEIGHT + TEXT_PADDING * 2, 15);
        }

        bubble.endFill();
        messageContainer.addChild(bubble);

        const dialogueText = new PIXI.Text(text, textStyle);
        dialogueText.interactive = true; // Ensure text is interactive for event propagation
        if (isLeft) {
            dialogueText.x = avatarSprite.width + TEXT_PADDING;
            dialogueText.y = TEXT_PADDING;
        } else {
            dialogueText.x = avatarSprite.width - TEXT_PADDING * 2;
            dialogueText.y = TEXT_PADDING;
        }
        bubble.addChild(dialogueText);

        this.dialogueContainer.addChild(messageContainer);

        this.updateScrollBounds();
        this.scrollToBottom(); // Always scroll to bottom for new messages
    }

    private scrollToBottom() {
        // Always scroll to the bottom by setting scrollOffset to show the latest message
        this.scrollOffset = -this.maxScrollY;
        this.applyScrollOffset();
    }

    public destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
}