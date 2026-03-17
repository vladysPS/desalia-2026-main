const obstacleImages = {
    cubata: new Image(),
    flamenco: new Image(),
    palmera: new Image(),
    botella: new Image(),
    maleta: new Image(),
    señal: new Image(),
};

obstacleImages.cubata.src = '/imgs/obstacles/cubata.png';
obstacleImages.flamenco.src = '/imgs/obstacles/flamenco.png';
obstacleImages.palmera.src = '/imgs/obstacles/palmera.png';
obstacleImages.botella.src = '/imgs/obstacles/botella-barcelo.png';
obstacleImages.maleta.src = '/imgs/obstacles/maleta.png';
obstacleImages.señal.src = '/imgs/obstacles/señal.png';
class Obstacle {
  constructor(ctx, canvasWidth, canvasHeight, road, scale = 1, obstacleNumber) {
    this.ctx = ctx;
    this.road = road;
    this.scale = scale;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // OBSTACLES TYPES
    this.obstacleTypes = ["cubata","flamenco","botella", "palmera", "maleta", "señal"];
    this.obstacle = this.obstacleTypes[obstacleNumber];

    this.obstacleImage = obstacleImages[this.obstacle];

    switch(this.obstacle) {
      case "cubata":
      this.baseWidth = 95;
      this.baseHeight = 141;
        break;

      case "flamenco":
      this.baseWidth = 165;
      this.baseHeight = 178;
        break;

      case "palmera":
      this.baseWidth = 167;
      this.baseHeight = 211;
        break;

      case "botella":
      this.baseWidth = 100;
      this.baseHeight = 256;
        break;

      case "maleta":
      this.baseWidth = 147;
      this.baseHeight = 275;
        break;

      case "señal":
      this.baseWidth = 174;
      this.baseHeight = 359;
        break;

      default:
      this.baseWidth = 100;
      this.baseHeight = 100;
        break;
    }

    // Initial render size derived from base dimensions and current scale
    this.width = this.baseWidth * this.scale;
    this.height = this.baseHeight * this.scale;

    this.x = canvasWidth + this.width;

    this.setYPosition();

    this.isOffscreen = false;
  }

  // This method is for reating a better illusion of collision, so there are no cases it feels like you collided with empty space
  getInsetAmount() {
    return 12 * this.scale;
  }

  getCollisionRectangles() {
    const inset = this.getInsetAmount();
    const rectangles = [];
  
    switch(this.obstacle) {
      case "cubata":
      case "palmera":
        // Single rectangle obstacles
        rectangles.push({
          x: this.x + inset,
          y: this.y + inset,
          width: this.width  - inset * 2,
          height: this.height  - inset * 2
        });
        break;
        
      case "flamenco":
        // Bottom rectangle
        rectangles.push({
          x: this.x + inset,
          y: this.y + this.height * 0.4 + inset,
          width: this.width - inset * 2,
          height: this.height * 0.6 - inset * 2
        });
        // Top rectangle
        rectangles.push({
          x: this.x + this.width - this.width * 0.4 + inset,
          y: this.y + inset,
          width: this.width * 0.4 - inset * 2,
          height: this.height * 0.648 - inset * 2
        });
        break;
        
      case "botella":
        // Bottom rectangle
        rectangles.push({
          x: this.x + inset,
          y: this.y + this.height * 0.4 + inset,
          width: this.width - inset * 2,
          height: this.height * 0.6 - inset * 2
        });
        // Top rectangle
        rectangles.push({
          x: this.x + this.width * 0.25 + inset,
          y: this.y + inset,
          width: this.width * 0.5 - inset * 2,
          height: this.height * 0.4 - inset * 2
        });
        break;
        
      case "maleta":
        // Main body
        rectangles.push({
          x: this.x + inset,
          y: this.y + this.height * 0.28 + inset,
          width: this.width - inset * 2,
          height: this.height * 0.7 - inset * 2
        });
        // Top handle
        rectangles.push({
          x: this.x + this.width * 0.272 + inset,
          y: this.y + inset,
          width: this.width * 0.45 - inset * 2,
          height: this.height * 0.28 - inset * 2
        });
        break;
        
      case "señal":
        // Main sign
        rectangles.push({
          x: this.x + inset,
          y: this.y + this.height * 0.22 + inset,
          width: this.width - inset * 2,
          height: this.height * 0.76 - inset * 2
        });
        // Post/top
        rectangles.push({
          x: this.x + this.width * 0.41 + inset,
          y: this.y + inset,
          width: this.width * 0.21 - inset * 2, 
          height: this.height * 0.22 - inset * 2
        });
        break;
        
      default:
    }
  
    return rectangles;
  }

  setYPosition() {
    // Anchor obstacle so its bottom sits at the vertical midpoint of the road
    // If the road image has not loaded yet (height = 0), fall back to near the canvas bottom
    const roadReady = this.road && this.road.height > 0;
    const roadCenterY = roadReady
      ? this.road.y + this.road.height / 2
      : this.canvasHeight - this.height / 2; // fallback: center above canvas bottom

    this.y = roadCenterY - this.height;
  }

  updateDimensions(canvasWidth, canvasHeight, scale, road) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    if (road) this.road = road;
    this.scale = scale;

    // Recompute size and X/Y relative to new scale/canvas
    const progress = 1 - (this.x / (this.canvasWidth + this.width)); // 0 at spawn, >1 when offscreen

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;

    this.x = this.canvasWidth + this.width - progress * (this.canvasWidth + this.width);
    this.setYPosition();
  }

  move(dt = 1 / 60) {
    this.x -= this.road.speed * dt;

    if (this.x + this.width < 0) {
      this.isOffscreen = true;
    }
  }

  draw() {
    switch(this.obstacle) {
      case "cubata":
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      case "flamenco":
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        this.ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, this.height * 0.6);
        this.ctx.fillRect(
          this.x + this.width - this.width * 0.4,
          this.y,
          this.width * 0.4,
          this.height * 0.648
        );
        this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      case "botella":
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, this.height * 0.6);
      this.ctx.fillRect(this.x + this.width * 0.25, this.y, this.width * 0.5, this.height * 0.4);
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      case "palmera":
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      case "maleta":
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fillRect(this.x, this.y + this.height * 0.28, this.width, this.height * 0.7);
      this.ctx.fillRect(
        this.x + this.width * 0.272,
        this.y,
        this.width * 0.45,
        this.height * 0.28
      );
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      case "señal":
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fillRect(this.x, this.y + this.height * 0.22, this.width, this.height * 0.76);
      this.ctx.fillRect(this.x + this.width * 0.41, this.y, this.width * 0.21, this.height * 0.22);
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
        break;

      default:
        break;
    }
  }
}

export default Obstacle;
