class Levels {
    constructor(ctx, canvasWidth, canvasHeight, scale = 1) {
        this.ctx = ctx;
        this.baseWidth = 416;
        this.baseHeight = 78;
    
        this.scale = scale;
        
        this.width = this.baseWidth * this.scale;
        this.height = this.baseHeight * this.scale;

        const padding = 40;
        this.x = canvasWidth - this.width - (padding * this.scale);
        this.y = canvasHeight - this.height - (padding * this.scale);

        this.img = new Image();
        this.img.src = "imgs/levels/level-1.png";
        this.img.isReady = false;
        this.img.onload = () => {
            this.img.isReady = true;
        };
        this.img.onerror = () => console.error("Failed to load levels image");
    }

    updateDimensions(canvasWidth, scale) {
        this.scale = scale;
        this.width = this.baseWidth * this.scale;
        this.height = this.baseHeight * this.scale;

        const padding = 40;
        this.x = canvasWidth - this.width - (padding * this.scale);
        this.y = canvasHeight - this.height - (padding * this.scale);
    }

    draw() {
        if (this.img.isReady) {
            this.ctx.drawImage(
                this.img, 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }
    }
}

export default Levels;