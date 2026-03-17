class Road {
  constructor(ctx, speed, canvasHeight) {
    this.speed = speed;
    this.canvasHeight = canvasHeight;
    this.ctx = ctx;
    this.x = 0;
    this.width = this.ctx.canvas.width;
    this.height = 0;
    this.y = 0;
    this.offset = 0.2;

    this.img = new Image();
    this.img.src = "imgs/camino-desalia-2.png";
    this.img.isReady = false;

    this.img.onload = () => {
      this.img.isReady = true;
      const aspectRatio = this.img.naturalHeight / this.img.naturalWidth;
      this.height = this.width * aspectRatio;
      this.y = this.canvasHeight - this.height - (this.offset * this.height);
    };
  }

  updateDimensions(canvasHeight) {
    this.canvasHeight = canvasHeight;
    this.width = this.ctx.canvas.width;

    if (this.img && this.img.isReady) {
      const aspectRatio = this.img.naturalHeight / this.img.naturalWidth;
      this.height = this.width * aspectRatio;
      this.y = this.canvasHeight - this.height;
    }


    if (this.x <= -this.width) {
      this.x = 0;
    }
  }

  draw() {
    if (this.img.isReady) {
      this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.img, this.x + this.width - 1, this.y, this.width, this.height);
    }
  }

  move(dt = 1 / 60) {
    this.x -= this.speed * dt;

    // Wrap seamlessly when the image scrolls off-screen
    while (this.x <= -this.width) {
      this.x += this.width;
    }
  }
}

export default Road;
