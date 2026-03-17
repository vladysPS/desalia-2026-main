const obstacleImages = {
    botella: new Image(),
    altavoz: new Image(),
    flamenco: new Image()
};

obstacleImages.botella.src = '/imgs/obstacles/botella-barcelo.png';
obstacleImages.altavoz.src = '';
obstacleImages.flamenco.src = '';
class Obstacle {
  constructor(ctx, canvasWidth, canvasHeight, road, scale = 1, obstacleNumber) {
    this.ctx = ctx;
    this.road = road;
    this.scale = scale;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // OBSTACLES TYPES
    this.obstacleTypes = ["cubata","flamenco","botella", "altavoz", "maleta", "señal"];
    this.obstacle = this.obstacleTypes[obstacleNumber];

    this.obstacleImage = obstacleImages.botella

    switch(this.obstacle) {
      case "cubata":
      this.baseWidth = 95;
      this.baseHeight = 141;
        break;

      case "flamenco":
      this.baseWidth = 165;
      this.baseHeight = 178;
        break;

      case "botella":
      this.baseWidth = 96;
      this.baseHeight = 256;
        break;

      case "altavoz":
      this.baseWidth = 178;
      this.baseHeight = 229;
        break;

      case "maleta":
      this.baseWidth = 147;
      this.baseHeight = 275;
        break;

      case "señal":
      this.baseWidth = 174;
      this.baseHeight = 362;
        break;

      default:
      this.baseWidth = 100;
      this.baseHeight = 100 ;
        break;
    }

    // Initial render size derived from base dimensions and current scale
    this.width = this.baseWidth * this.scale;
    this.height = this.baseHeight * this.scale;

    this.x = canvasWidth + this.width;

    this.setYPosition();

    this.isOffscreen = false;
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
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
        break;

      case "flamenco":
        this.ctx.fillStyle = "pink";
        this.ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, this.height * 0.6);
        this.ctx.fillRect(
          this.x + this.width - this.width * 0.4,
          this.y,
          this.width * 0.4,
          this.height * 0.648
        );
        break;

      case "botella":
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, this.height * 0.6);
      this.ctx.fillRect(this.x + this.width * 0.25, this.y, this.width * 0.5, this.height * 0.4);
        break;

      case "altavoz":
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
        break;

      case "maleta":
      this.ctx.fillStyle = "orange";
      this.ctx.fillRect(this.x, this.y + this.height * 0.28, this.width, this.height * 0.7);
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(
        this.x + this.width * 0.272,
        this.y,
        this.width * 0.45,
        this.height * 0.28
      );
        break;

      case "señal":
      this.ctx.fillStyle = "orange";
      this.ctx.fillRect(this.x, this.y + this.height * 0.23, this.width, this.height * 0.76);
      this.ctx.save(); // save current state
      this.ctx.fillStyle = "yellow";
      // Calculate rectangle dimensions
      const rectWidth = this.width * 0.69;
      const rectHeight = this.height * 0.33;
      const rectX = this.x + ((this.width - rectWidth) / 2);
      const rectY = this.y + (this.height - (this.height * 0.93));
      // Move to center of rectangle
      this.ctx.translate(rectX + rectWidth / 2, rectY + rectHeight / 2);
      // Rotate 45 degrees (in radians!)
      this.ctx.rotate(45 * Math.PI / 180);
      // Draw rectangle centered at origin
      this.ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
      this.ctx.restore(); // restore original state
        break;

      default:
        break;
    }
  }
}

export default Obstacle;
