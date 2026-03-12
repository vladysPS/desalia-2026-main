class Background {
  constructor(ctx, imgHeight, initialX, speed) {
    this.imgSrc = "imgs/background/zm1-peq.png";
    this.speed = speed;

    this.ctx = ctx;
    this.x = initialX;
    this.y = 0;
    this.height = imgHeight;
    this.canvasWidth = this.ctx.canvas.width;
    this.img = new Image();
    this.img.src = this.imgSrc;
    this.img.isReady = false;
    this.img.onload = () => {
      this.img.isReady = true;
      this.width =
        (this.img.naturalWidth / this.img.naturalHeight) * this.height;
    };
  }

  updateDimensions(canvasHeight, scale) {
    this.height = canvasHeight;
    this.canvasWidth = this.ctx.canvas.width;

    if (this.img && this.img.isReady) {
      this.width =
        (this.img.naturalWidth / this.img.naturalHeight) * this.height;
    }
  }

  draw() {
    if (this.img.isReady) {
      this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  // Move the background left by xx pixels per frame
  // Once the image is off the screen, mark it as finished
  // Call the stopGame method from Game class once the image is finished
  move(dt = 1 / 60) {
    this.xWhereStop = -this.width + this.canvasWidth;
    if (this.x > this.xWhereStop) {
      this.x -= this.speed * dt;
    } else {
      this.game.stopGame();
    }
  }
}

export default Background;
