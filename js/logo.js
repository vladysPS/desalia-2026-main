class Logo {
    constructor(ctx, canvasWidth, scale = 1) {
        this.ctx = ctx;
        this.baseWidth = 436;
        this.baseHeight = 155;
    
        this.scale = scale;
        
        this.width = this.baseWidth * this.scale;
        this.height = this.baseHeight * this.scale;

        this.x = (canvasWidth - this.width) / 2;
        this.y = 20 * this.scale; 

        this.img = new Image();
        this.img.src = "imgs/barcelo_desalia-logo.png";
        this.img.isReady = false;
        this.img.onload = () => {
            console.log("Logo loaded");
            this.img.isReady = true;
        };
        this.img.onerror = () => console.error("Failed to load logo");
    }

    updateDimensions(canvasWidth, scale) {
        this.scale = scale;
        this.width = this.baseWidth * this.scale;
        this.height = this.baseHeight * this.scale;
        this.x = (canvasWidth - this.width) / 2;
        this.y = 20 * this.scale;
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

export default Logo;