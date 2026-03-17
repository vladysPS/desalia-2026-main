import Background from './js/background.js';
import Road from './js/road.js';
import Player from './js/player.js';
import Obstacle from './js/obstacle.js';
import Logo from './js/logo.js';

class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.rafId = undefined; 
    this.isRunning = false;
    this.lastTime = 0;
    this.todoRectoSinMiedo = true; 

    this.baseWidth = 1920;
    this.baseHeight = 1080;
    this.targetAspect = this.baseWidth / this.baseHeight; 

    // Speeds expressed in px/s for base scale (scale = 1)
    this.roadBaseSpeed = 1200; // base 1200 
    this.roadAccelBase = 25;  // base 25
    this.backBaseSpeed = 60;  // 1px per frame at 60fps

    // SOUNDS
    this.isThemePlaying = false;
    this.soundCrash = new Audio("sounds/flappyhit.mp3");
    this.soundCrash.volume = 0.5;
    this.soundJump = new Audio("sounds/flappyflap.mp3");
    this.soundJump.volume = 0.5;
    this.theme = new Audio('sounds/samba.mp3');
    this.theme.volume = 0.5;
    this.countDownSound = new Audio('sounds/countdown.mp3');
    this.countDownSound.volume = 0.5;

    // OBSTACLES
    this.obstacles = [];
    this.obstacleTimer = 0; // seconds
    this.obstacleInterval = this.getRandomObstacleTime(); // seconds
    this.hasCollision = false;

    this.setResponsiveSizes();
    window.addEventListener('resize', () => {
      this.setResponsiveSizes();
    });
    this.logo = new Logo(this.ctx,this.canvasWidth, this.scale);
    this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
    this.background.game = this; // Pass the current Game instance to the Background so I can stop the game
    
    this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);
    
    this.player = new Player(this.ctx, this.canvasHeight, this.soundJump, this.road, this.scale);

  }
  getRandomObstacleTime() {
    return 1 + Math.random() * 2; // between 1s and 3s
  }
  setResponsiveSizes() {
    const previousScale = this.scale || 1;
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    const padding = 14; // breathing room around the canvas (all sides)
    const availableWidth = Math.max(window.innerWidth - padding * 2, 320);
    const availableHeight = Math.max(window.innerHeight - padding * 2, 180);

    let width = availableWidth;
    let height = width / this.targetAspect;

    // If the computed height overflows the viewport, constrain by height instead.
    if (height > availableHeight) {
      height = availableHeight;
      width = height * this.targetAspect;
    }

    canvasContainer.style.width = `${width}px`;
    canvasContainer.style.height = `${height}px`;

    this.canvasWidth = Math.round(width);
    this.canvasHeight = Math.round(height);
    this.scale = this.canvasHeight / this.baseHeight;

    this.ctx.canvas.width = this.canvasWidth;
    this.ctx.canvas.height = this.canvasHeight;

    // Re-scale speeds so motion stays proportional to canvas size
    const scaleRatio = this.scale / previousScale;
    if (this.roadSpeed === undefined) {
      this.roadSpeed = this.roadBaseSpeed * this.scale;
      this.roadAccel = this.roadAccelBase * this.scale;
    } else {
      this.roadSpeed *= scaleRatio;
      this.roadAccel *= scaleRatio;
    }

    if (this.backSpeed === undefined) {
      this.backSpeed = this.backBaseSpeed * this.scale;
    } else {
      this.backSpeed *= scaleRatio;
    }

    // Propagate new sizes to game elements
    if (this.road && typeof this.road.updateDimensions === 'function') {
      this.road.updateDimensions(this.canvasHeight, this.scale);
      this.road.speed = this.roadSpeed;
    }
    if (this.background && typeof this.background.updateDimensions === 'function') {
      this.background.updateDimensions(this.canvasHeight, this.scale);
      this.background.speed = this.backSpeed;
    }
    if (this.logo && typeof this.logo.updateDimensions === 'function') {
      this.logo.updateDimensions(this.canvasWidth, this.scale);
    }
    if (this.player && typeof this.player.updateDimensions === 'function') {
      this.player.updateDimensions(this.canvasHeight, this.scale);
    }
    this.obstacles.forEach(obstacle => {
      if (typeof obstacle.updateDimensions === 'function') {
        obstacle.updateDimensions(this.canvasWidth, this.canvasHeight, this.scale, this.road);
      }
    });
  }
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  collisions() {
    if (this.hasCollision) return;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (this.checkCollision(this.player, obstacle)) {
        this.hasCollision = true;

        this.stopGame("lose");
        this.soundCrash.currentTime = 0;
        this.soundCrash.play();

        return;
      }
    }
  }
  gameLoop() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();

    const step = (timestamp) => {
      if (!this.isRunning) return;

      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // formula to normalize the seconds between each refresh
      this.lastTime = timestamp;
        
        if (!this.isThemePlaying) {
          this.theme.loop = true;
          this.theme.currentTime = 0;
          // this.theme.play();
          this.isThemePlaying = true;
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
      // accelerate road speed over time
      this.roadSpeed += this.roadAccel * dt;
        this.road.speed = this.roadSpeed;
        
      this.background.move(dt);
      this.background.draw();
      this.road.move(dt);
      this.road.draw();
      this.player.move(dt);
      this.player.draw(dt);
      this.logo.draw();

        // OBSTACLES
      this.obstacleTimer += dt;
        if (this.obstacleTimer >= this.obstacleInterval) {
          // Generate random number between 0 and 5 to choose a random obstacle, with more possibilities of the first three 
          const obstacleNumber = (() => {
            const r = Math.random();
            return r < 0.8             // 80% chance
              ? Math.floor(Math.random() * 4)   // 0–3
              : 4 + Math.floor(Math.random() * 2); // 20% chance → 4 or 5
          })();


          this.obstacles.push(
            new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road, this.scale, obstacleNumber)
          );
          this.obstacleTimer = 0;
          this.obstacleInterval = this.getRandomObstacleTime();
        }

        this.obstacles.forEach(obstacle => {
        obstacle.move(dt);
          obstacle.draw();
        });

        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffscreen);

        if (!this.todoRectoSinMiedo) {
          this.collisions();
        }

      if (this.isRunning) {
        this.rafId = requestAnimationFrame(step);
    }
    };

    this.rafId = requestAnimationFrame(step);
  }
  stopGame(reason) {
    if (reason === "lose"){
      console.log("You lost!");
    } else if (reason === "win"){
      console.log("You won!");
    }
    if (!this.isRunning) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = undefined;
    this.isRunning = false;

    this.theme.pause();
    this.isThemePlaying = false;
  }
}

export default Game;
