import Background from './js/background.js';
import Road from './js/road.js';
import Player from './js/player.js';
import Obstacle from './js/obstacle.js';
import Logo from './js/logo.js';
import Counter from './js/counter.js';
import Levels from './js/levels.js';
class Game {
  constructor(ctx, playerAvatar) {
    this.ctx = ctx;
    this.rafId = undefined; 
    this.isRunning = false;
    this.lastTime = 0;
    this.todoRectoSinMiedo = true; 
    this.playerAvatar = playerAvatar;

    this.baseWidth = 1920;
    this.baseHeight = 1080;
    this.targetAspect = this.baseWidth / this.baseHeight; 

    // Level logic
    this.maxLevel = 10;              
    this.currentLevel = 1;           
    this.segmentWidth = 0;

    // ROAD AND BACKGROUND BASE SPEEDS
    // Speeds expressed in px/s for base scale (scale = 1)
    this.roadBaseSpeed = 1600; // base 1600 
    // delete later:this.roadAccelBase = 25;  // base 25
    this.backBaseSpeed = 120;  // base 60
    this.baseObstacleIntervalMs = 2000;

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
    // OLD TIME: this.obstacleInterval = this.getRandomObstacleTime(); // seconds
    this.hasCollision = false;

    this.setResponsiveSizes();
      window.addEventListener('resize', () => {
        this.setResponsiveSizes();
    });
    this.logo = new Logo(this.ctx,this.canvasWidth, this.scale);
    this.levels = new Levels(this.ctx, this.canvasWidth, this.canvasHeight, this.scale);
    this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed, this);
    this.background.game = this; // Pass the current Game instance to the Background so I can stop the game

    this.counter = new Counter(this.ctx, this.canvasWidth, this.canvasHeight);
    this.score = 0; 
    
    this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);
        
    
    this.player = null;

  }
  applyLevelUp() {
    this.roadSpeed = this.roadBaseSpeed * this.scale * (1 + 0.08 * (this.currentLevel - 1));
    this.backSpeed = this.backBaseSpeed * this.scale * (1 + 0.05 * (this.currentLevel - 1));

    // OLD TIME this.obstacleInterval = this.getRandomObstacleTime(this.currentLevel);
  }

  setPlayerAvatar(avatarNumber){
    this.player = new Player(this.ctx, this.canvasHeight, this.soundJump, this.road, this.scale, avatarNumber);

    // Initialize the first obstacle interval now that player exists
    const randomType = Math.floor(Math.random() * 6);
    const firstObstacle = new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road, this.scale, randomType);
    this.obstacleInterval = this.getNextObstacleInterval(firstObstacle);
  }
  // OLD TIME getRandomObstacleTime(level = this.currentLevel) {
  //   const baseMin = 0.8; 
  //   const baseMax = 1.7;   

  //   // exponential difficulty: harder levels spawn faster
  //   const factor = Math.pow(0.85, level - 1); 
  //   const minInterval = Math.max(0.4, baseMin * factor);
  //   const maxInterval = Math.max(0.6, baseMax * factor);

  //   // ensure minimum time for player to react
  //   const minSafe = 0.5; 
  //   return Math.max(minSafe, minInterval + Math.random() * (maxInterval - minInterval));
  // }
  getNextObstacleInterval(obstacle) {
    // Player jump physics
    const jumpDuration = 2 * Math.abs(this.player.jumpStrength) / this.player.gravity;
    const jumpDistance = this.road.speed * jumpDuration;

    // Base minimum distance between obstacles
    const buffer = 20; // pixels
    const minDistance = jumpDistance + obstacle.width + buffer;

    // Base interval in seconds
    let interval = minDistance / this.road.speed;

    // Non-linear difficulty scaling
    // Exponential decay: early levels easy, last 3 levels very tight
    const decayBase = 0.85; // smaller = faster decay, more difficult early
    const levelFactor = Math.pow(decayBase, this.currentLevel - 1);
    interval *= levelFactor;

    // Random variation for natural feel
    interval *= 0.85 + Math.random() * 0.3;

    // Clamp to ensure player can always jump
    const minSafeInterval = jumpDuration * 1.05; // slightly above jump distance
    interval = Math.max(interval, minSafeInterval);

    // Occasional “bonus gap”
    const bonusChance = 0.15; // 15% of obstacles
    if (Math.random() < bonusChance) {
      const bonusMultiplier = 1.5 + Math.random() * 1.5; // 1.5–3x
      interval *= bonusMultiplier;
      console.log(`Bonus gap! Interval increased: ${interval.toFixed(2)}s`);
    }

    return interval;
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
      // delete later: this.roadAccel = this.roadAccelBase * this.scale;
    } else {
      this.roadSpeed *= scaleRatio;
      // delete later: this.roadAccel *= scaleRatio;
    }

    if (this.backSpeed === undefined) {
      this.backSpeed = this.backBaseSpeed * this.scale;
    } else {
      this.backSpeed *= scaleRatio;
    }

    // Propagate new sizes to game elements
    if (this.road && typeof this.road.updateDimensions === 'function') {
      this.road.updateDimensions(this.canvasHeight, this.scale);
      // check if we need this: this.road.speed = this.roadSpeed;
    }
    if (this.background && typeof this.background.updateDimensions === 'function') {
      this.background.updateDimensions(this.canvasHeight, this.scale);
      this.background.speed = this.backSpeed;
    }
    if (this.logo && typeof this.logo.updateDimensions === 'function') {
      this.logo.updateDimensions(this.canvasWidth, this.scale);
    }
    if (this.levels && typeof this.levels.updateDimensions === 'function') {
      this.levels.updateDimensions(this.canvasWidth, this.canvasHeight, this.scale);
    }
    if (this.player && typeof this.player.updateDimensions === 'function') {
      this.player.updateDimensions(this.canvasHeight, this.scale);
    }
    if (this.counter && typeof this.counter.updateDimensions === 'function') {
      this.counter.updateDimensions(this.canvasWidth, this.scale);
    }
    this.obstacles.forEach(obstacle => {
      if (typeof obstacle.updateDimensions === 'function') {
        obstacle.updateDimensions(this.canvasWidth, this.canvasHeight, this.scale, this.road);
      }
    });
  }
  checkCollision(player, obstacle) {
    // Get all collision rectangles from the obstacle
    const collisionRects = obstacle.getCollisionRectangles();
    // Check collision with any of the obstacle's rectangles
    for (const rect of collisionRects) {
      if (player.x < rect.x + rect.width &&
          player.x + player.width > rect.x &&
          player.y < rect.y + rect.height &&
          player.y + player.height > rect.y) {
        return true; 
      }
    }
    return false; 
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
      
      // Increase score (e.g., 10 points per second)
      this.score += dt * 10;

      // accelerate road speed over time
      // delete later:this.roadSpeed += this.roadAccel * dt;
      this.road.speed = this.roadSpeed;
      this.background.move(dt);
      this.background.draw();
      this.road.move(dt);
      this.road.draw();
      this.player.move(dt);
      this.player.draw(dt);
      this.logo.draw();
      this.levels.draw();
      this.counter.draw(this.score);

      // CHECKING AND UPDATING THE LEVELS  
      if (this.background.img.isReady && this.segmentWidth === 0) {
          this.segmentWidth = (this.background.img.width * this.scale) / this.maxLevel;
          
          console.log("Segment width initialized:", this.segmentWidth);
          console.log("Total width scaled:", this.background.img.width * this.scale);
      }

      const distance = -this.background.x;  // positive pixels scrolled
      // Check if we've crossed into a new level (but not beyond max)
      if (this.currentLevel < this.maxLevel && 
          distance >= this.segmentWidth * this.currentLevel) {
          
          this.currentLevel++;
          this.applyLevelUp();
          this.levels.img.src = `imgs/levels/level-${this.currentLevel}.png`;
          console.log("Level up! Current level:", this.currentLevel);
          console.log("Current road speed:", this.road.speed);
          console.log("Current background speed:", this.background.speed);
          //this.showLevelBanner(this.currentLevel); 
      }

      // OBSTACLES
      this.obstacleTimer += dt;
        if (this.obstacleTimer >= this.obstacleInterval) {
          // Generate random number between 0 and 5 to choose a random obstacle, with more possibilities of the first three 
          const obstacleNumber = (() => {
            return Math.floor(Math.random() * 6);
          })();

          // OLD: this.obstacles.push(
          //   new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road, this.scale, obstacleNumber)
          // );
          // OLD :this.obstacleInterval = this.getRandomObstacleTime(this.currentLevel);
          const newObstacle = new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road, this.scale, obstacleNumber);
          this.obstacles.push(newObstacle);

          this.obstacleTimer = 0;
          this.obstacleInterval = this.getNextObstacleInterval(newObstacle);
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
    console.log(`Final score: ${Math.floor(this.score)}`);
    if (!this.isRunning) return;
    cancelAnimationFrame(this.rafId);
    this.score = 0;
    this.rafId = undefined;
    this.isRunning = false;

    this.theme.pause();
    this.isThemePlaying = false;
  }
}

export default Game;
