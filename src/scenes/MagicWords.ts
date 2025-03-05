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
    private scrollOffset: number = 0; 


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

        this.dialogueContainer.y = 60; 
        this.container.addChild(this.dialogueContainer);
        this.app.stage.addChild(this.container);

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

            newOffset = Math.min(0, newOffset);
            newOffset = Math.max(-this.maxScrollY, newOffset); 

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

        this.dialogueContainer.on('wheel', (event: PIXI.FederatedWheelEvent) => {
            event.stopPropagation();

            const normalizedDelta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 100);
            const scrollSpeed = 5; 
            let newOffset = this.scrollOffset - (normalizedDelta * scrollSpeed) / 10;

            newOffset = Math.min(0, newOffset);
            newOffset = Math.max(-this.maxScrollY, newOffset);

            this.scrollOffset = newOffset;
            this.applyScrollOffset();
        });

        this.setupScrollbar();
    }

    private setupScrollbar() {
        const scrollbarWidth = 10; 
        const scrollbarHeight = this.dialogueBoxHeight - 20;
        const scrollbarX = this.leftIndent * this.app.screen.width + this.containerWidth + 5; 
        const scrollbarY = 60; 

        const scrollbarBg = new PIXI.Graphics();
        scrollbarBg.beginFill(0x666666, 0.5);
        scrollbarBg.drawRoundedRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 5);
        scrollbarBg.endFill();
        this.container.addChild(scrollbarBg);

        const contentHeight = this.dialogueContainer.height;
        const visibleHeight = this.dialogueBoxHeight;
        const handleHeight = Math.max(20, (visibleHeight / contentHeight) * scrollbarHeight); 
        const maxHandleY = scrollbarHeight - handleHeight;

        let isDraggingHandle = false;
        let startHandleY = 0;
        let startScrollOffset = 0;


        this.dialogueContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
            if (!isDraggingHandle) return;

            const currentY = event.global.y;
            const deltaY = currentY - (startHandleY - startScrollOffset); 
            let newHandleY = startHandleY + deltaY;

            newHandleY = Math.max(scrollbarY, Math.min(scrollbarY + maxHandleY, newHandleY));

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
        this.dialogueContainer.children.forEach((child) => {
            if (child instanceof PIXI.Container) {
                const initialY = (child as any).initialY || 0;
                child.y = initialY + this.scrollOffset;
            }
        });
    }

    private updateScrollBounds() {
        const contentHeight = this.dialogueContainer.height;
        this.maxScrollY = Math.max(0, contentHeight - this.dialogueBoxHeight + 20);
        this.dialogueContainer.interactive = true;
        this.applyScrollOffset(); 
    }

    private async fetchDialogue() {
        try {
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();

            data.emojies.forEach((emoji: any) => {
                this.emojiMap[`{${emoji.name}}`] = emoji.url;
            });

            data.avatars.forEach((avatar: any) => {
                this.avatars[avatar.name] = { url: avatar.url, position: avatar.position };
            });

            this.displayDialogue(data.dialogue || []);
        } catch (error) {
            console.error('Error fetching dialogue:', error);
        }
    }

    private displayDialogue(dialogue: { name?: string; text: string }[]) {
        this.dialogueContainer.removeChildren();
        this.currentIndex = 0;
        this.scrollOffset = 0; 
        this.updateScrollBounds(); 
        this.showNextMessage(dialogue);
    }

    private showNextMessage(dialogue: { name?: string; text: string }[]) {
        if (this.currentIndex >= dialogue.length) {
            this.updateScrollBounds();
            return;
        }

        const line = dialogue[this.currentIndex];
        this.currentIndex++;

        this.renderDialogueLine(line);

        setTimeout(() => {
            this.showNextMessage(dialogue);
        }, 1000); 
    }

    private renderDialogueLine(line: { name?: string; text: string }) {
        console.log('Rendering line:', line, 'Current children count:', this.dialogueContainer.children.length);
    
        const { name, text } = line;
        const characterName = name || "Unknown";
    
        const avatarData = this.avatars[characterName] || { url: this.defaultAvatarUrl, position: 'right' };
        const isLeft = avatarData.position === 'left';
    
        const TEXT_PADDING = this.app.screen.width * 0.008;
        const MAX_MESSAGE_WIDTH = this.containerWidth * 0.6;
        const EMOJI_SIZE = this.app.screen.width * 0.015;
        const EMOJI_PADDING = EMOJI_SIZE * 0.2; 
        const EMOJI_RIGHT_PADDING = EMOJI_SIZE * 0.2; 
    
        const DEFAULT_EMOJI_URL = './public/assets/images/avatar.png';
    
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: EMOJI_SIZE,
            fill: 0xffffff,
            wordWrap: true,
            wordWrapWidth: MAX_MESSAGE_WIDTH - TEXT_PADDING * 2,
        });
    
        const textContainer = new PIXI.Container();
        textContainer.interactive = true;
    
        const emojiRegex = /\{([a-zA-Z0-9_]+)\}/g;
        let processedText = text;
        const emojiReplacements: { original: string, url: string, index: number }[] = [];
    
        processedText = processedText.replace(emojiRegex, (match, emojiName) => {
            const fullMarker = `{${emojiName}}`;
            let emojiUrl = this.emojiMap[fullMarker];
            console.log('Emoji Match:', { match, emojiName, fullMarker, emojiUrl });
    
            const index = processedText.indexOf(match);
    
            if (!emojiUrl) {
                console.warn(`Emoji not found in emojiMap: ${fullMarker}, using default smile emoji`);
                emojiUrl = DEFAULT_EMOJI_URL;
            }
    
            emojiReplacements.push({ original: match, url: emojiUrl, index });
            return '   '; 
        });
    
        const baseText = new PIXI.Text(processedText, textStyle);
        console.log('Processed Text:', processedText);
        textContainer.addChild(baseText);
    
        emojiReplacements.sort((a, b) => a.index - b.index);
    
        // Measure the base text to position emojis
        const textMetrics = PIXI.TextMetrics.measureText(processedText, textStyle);
        const lineHeight = textMetrics.lineHeight || EMOJI_SIZE; 
        console.log('Text Metrics:', textMetrics, 'Line Height:', lineHeight);
    
        // Position each emoji
        emojiReplacements.forEach((emojiData, i) => {
            console.log('Processing Emoji:', emojiData);
            const emojiSprite = PIXI.Sprite.from(emojiData.url);
            console.log('Emoji Sprite Created:', { url: emojiData.url, sprite: emojiSprite });
    
            if (emojiSprite.texture && !emojiSprite.texture.baseTexture.valid) {
                console.warn('Emoji texture not valid for URL:', emojiData.url);
                emojiSprite.texture.on('update', () => {
                    if (emojiSprite.texture.baseTexture.valid) {
                        emojiSprite.width = EMOJI_SIZE;
                        emojiSprite.height = EMOJI_SIZE;
                        this.positionEmoji(emojiSprite, 0, 0, EMOJI_PADDING, EMOJI_RIGHT_PADDING, lineHeight, EMOJI_SIZE, textContainer);
                    }
                });
                return;
            }
    
            emojiSprite.width = EMOJI_SIZE;
            emojiSprite.height = EMOJI_SIZE;
    
            const textBeforeEmoji = processedText.substring(0, emojiData.index);
            const metricsBefore = PIXI.TextMetrics.measureText(textBeforeEmoji, textStyle);
    
            const linesBefore = metricsBefore.lines || [];
            const lineIndex = linesBefore.length - 1; 
            const currentY = lineIndex * lineHeight;
    
            const lastLineText = linesBefore[lineIndex] || '';
            const placeholderLength = '   '.length;
    
            let textOnCurrentLineBeforeEmoji = lastLineText;
            if (lastLineText.endsWith('   ')) {
                textOnCurrentLineBeforeEmoji = lastLineText.substring(0, lastLineText.length - placeholderLength).trimEnd();
            }
    
            const metricsOnCurrentLine = PIXI.TextMetrics.measureText(textOnCurrentLineBeforeEmoji, textStyle);
            const currentX = metricsOnCurrentLine.width || 0;
    
            console.log('Positioning Emoji:', {
                lineIndex,
                currentX,
                currentY,
                textBeforeEmoji,
                lastLineText,
                textOnCurrentLineBeforeEmoji,
                metricsOnCurrentLine,
            });
    
            this.positionEmoji(emojiSprite, currentX, currentY, EMOJI_PADDING, EMOJI_RIGHT_PADDING, lineHeight, EMOJI_SIZE, textContainer);
        });
    
        const MESSAGE_WIDTH = Math.min(textContainer.width, MAX_MESSAGE_WIDTH);
        const MESSAGE_HEIGHT = textMetrics.height;
    
        const GAP_PERCENTAGE = 0.15;
        const yOffset = this.dialogueContainer.children.length * (this.app.screen.height * GAP_PERCENTAGE);
    
        const messageContainer = new PIXI.Container() as any;
        messageContainer.initialY = yOffset;
        messageContainer.y = yOffset + this.scrollOffset;
    
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
        bubble.interactive = true;
    
        if (isLeft) {
            bubble.drawRoundedRect(avatarSprite.width, 0, MESSAGE_WIDTH + TEXT_PADDING * 2, MESSAGE_HEIGHT + TEXT_PADDING * 2, 15);
        } else {
            bubble.drawRoundedRect(avatarSprite.width - TEXT_PADDING * 3, 0, MESSAGE_WIDTH + TEXT_PADDING * 2, MESSAGE_HEIGHT + TEXT_PADDING * 2, 15);
        }
    
        bubble.endFill();
        messageContainer.addChild(bubble);
    
        if (isLeft) {
            textContainer.x = avatarSprite.width + TEXT_PADDING;
            textContainer.y = TEXT_PADDING;
        } else {
            textContainer.x = avatarSprite.width - TEXT_PADDING * 2;
            textContainer.y = TEXT_PADDING;
        }
        bubble.addChild(textContainer);
    
        this.dialogueContainer.addChild(messageContainer);
    
        this.updateScrollBounds();
        this.scrollToBottom();
    }
    
    private positionEmoji(emojiSprite: PIXI.Sprite, currentX: number, currentY: number, emojiLeftPadding: number, emojiRightPadding: number, lineHeight: number, emojiSize: number, textContainer: PIXI.Container) {
        emojiSprite.x = currentX + emojiLeftPadding;
        emojiSprite.y = currentY + (lineHeight - emojiSize) / 2;
        textContainer.addChild(emojiSprite);
    }
    
    private scrollToBottom() {
        this.scrollOffset = -this.maxScrollY;
        this.applyScrollOffset();
    }

    public destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
}