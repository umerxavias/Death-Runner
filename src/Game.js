import Camera from "./Camera";
import Controller from "./Controller";
import Entity from "./Entity";
import InputManager from "./InputManager";
import ParticleSystem from "./ParticleSystem";
import Player from "./Player";
import Render from "./Render";
import SpriteSheetManager from "./SpriteSheetManager";
import SoundManager from "./SoundManager";
import Coin from "./Coin";
import Bullet from "./Bullet";
import FinishLine from "./FinishLine";
import Arrow from "./Arrow";
import { v4 } from "uuid";
import { getRandomInteger } from "./random";

export default class Game {
  constructor(canvas, ctx, ssm) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = ctx;

    /**
     * @type {SpriteSheetManager}
     */
    this.ssm = ssm;

    this.render = new Render(this);
    this.camera = new Camera(this);

    this.inputManager = new InputManager();
    this.inputManager.setCanvas(canvas);
    
    // Add direct canvas click handler as backup
    canvas.addEventListener('click', (e) => {
      if (this.gameState === 'menu') {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        console.log('Direct canvas click at:', mx, my); // Debug
        
        if (this.menuButtons) {
          // Main menu buttons
          if (this.menuState === 'main') {
            if (this.menuButtons.start) {
              const b = this.menuButtons.start;
              if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                console.log('START clicked via direct handler');
                this.startGame();
                return;
              }
            }
            if (this.menuButtons.controls) {
              const b = this.menuButtons.controls;
              if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                console.log('CONTROLS clicked via direct handler');
                this.menuState = 'controls';
                return;
              }
            }
            if (this.menuButtons.sound) {
              const b = this.menuButtons.sound;
              if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                console.log('SOUND clicked via direct handler');
                this.menuState = 'sound';
                return;
              }
            }
            if (this.menuButtons.theme) {
              const b = this.menuButtons.theme;
              if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                console.log('THEME clicked via direct handler');
                this.menuState = 'theme';
                return;
              }
            }
          }
          
          // Back button in submenus
          if ((this.menuState === 'controls' || this.menuState === 'sound' || this.menuState === 'theme') && this.menuButtons.back) {
            const b = this.menuButtons.back;
            if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
              console.log('BACK clicked via direct handler');
              this.menuState = 'main';
              return;
            }
          }
        }
      }
    });
    this.particleSystem = new ParticleSystem(this);
    this.sound = new SoundManager();
    this.sound.preload();

    this.player = new Player(this);
    this.controller = new Controller(this);

    /**
     * @type {Object.<string, Entity>}
     */
    this.entities = {};
    this.arrow = new Arrow(this);

    const level = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 5, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0],
      [0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 0, 5, 0, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0],
      [0, 5, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0],
      [0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 0],
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5],
      [0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0],
      [5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5],
      [5, 5, 5, 0, 0, 0, 5, 5, 0, 0, 0, 5, 5, 5, 5],
      [5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5],
      [5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5],
      [5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    ];

    this.showInfo = false;
    this.map = level.flat(1);

    this.levelWidth = level[0].length;
    this.levelHeight = level.length;
    this.levelExtended = false; // Track if level has been extended
    this.camera.endY = this.levelHeight - 7;
    this.camera.startY = this.levelHeight - 15;
    this.camera.maxY = this.levelHeight;
    this.camera.minX = 0;

    // Ensure player starts on a solid floor near the beginning
    this.player.x = 2;
    this.placePlayerOnGround();

    this.spawnTick = 0;
    this.fpsTick = 0;
    this.fps = 0;

    // Game state
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('platformer_high_score') || '0');
    this.gameState = 'menu'; // 'menu', 'playing', 'dead', 'won'
    this.menuState = 'main'; // 'main', 'controls', 'sound', 'theme'
    this.finishLine = null;
    this.placeFinishLine();

    // Spawn some initial coins
    for (let i = 0; i < 5; i++) {
      this.spawnCoin(getRandomInteger(2, this.levelWidth - 4), getRandomInteger(this.levelHeight - 15, this.levelHeight - 8));
    }

    if (this.map.length !== this.levelWidth * this.levelHeight) {
      throw new Error("Invalid map length: " + this.map.length);
    }

    /**
     * - `0` = No collision
     * - `1` = Left
     * - `2` = Right
     * - `4` = Top
     * - `8` = Bottom
     */
    this.collisionMap = this.createCollisionMap();
    
    // Seed neatly aligned coins along top surfaces near the start
    this.seedCoins();
  }

  end() {
    this.inputManager.end();
  }

  spawnEntity() {
    var id = v4();

    var entity = new Entity(this);
    this.entities[id] = entity;

    var direction = Math.random() > 0.5 ? -1 : 1;

    if (this.camera.startX <= 0) {
      direction = 1;
    }

    if (direction === -1) {
      entity.x = this.camera.endX + 2;
    } else {
      entity.x = this.camera.startX - 2;
    }

    entity.direction = direction;

    entity.y = this.player.y + getRandomInteger(-2, 2);
  }

  spawnCoin(x, y) {
    // Snap coin to top surface: find first air tile with solid directly below
    const startX = Math.floor(x);
    const startY = Math.floor(y);
    let placeX = startX;
    let placeY = startY;
    for (let dy = -20; dy <= 20; dy++) {
      const ay = startY + dy;
      if (ay < 0 || ay >= this.levelHeight - 1) continue;
      const air = !this.map[this.convertCoordinatesToIndex(startX, ay)];
      const solidBelow = !!this.map[this.convertCoordinatesToIndex(startX, ay + 1)];
      if (air && solidBelow) {
        placeY = ay;
        break;
      }
    }

    var id = v4();
    var coin = new Coin(this);
    // Center horizontally on tile; set bottom to surface (ay + 1)
    coin.x = placeX + 0.5 - coin.w / 2;
    coin.y = placeY + 1 - coin.h - 0.01;
    this.entities[id] = coin;
  }

  spawnBullet(x, y, directionX, directionY = 0) {
    var id = v4();
    var bullet = new Bullet(this, x, y, directionX, directionY);
    this.entities[id] = bullet;
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('platformer_high_score', this.highScore.toString());
    }
  }

  playerDie() {
    // Only die when actually hit (this is called by bullet collision)
    this.gameState = 'dead';
    this.particleSystem.spawnParticles(this.player.x + this.player.w/2, this.player.y + this.player.h/2, 15, 0.8);
    this.sound && this.sound.playDeath();
  }

  gameWin() {
    this.gameState = 'won';
    this.particleSystem.spawnParticles(this.player.x + this.player.w/2, this.player.y + this.player.h/2, 20, 1.0, "#00FF00");
    this.sound && this.sound.playWin();
  }

  startGame() {
    this.gameState = 'playing';
    this.menuState = 'main';
    this.score = 0;
    this.entities = {};
    this.player.x = 2;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.health = this.player.maxHealth;
    this.player.invulnerable = true;
    this.player.invulnerableTimer = 1.0; // Give 1 second of invulnerability at start
    this.camera.x = 0;
    this.camera.y = this.camera.startY;
    this.levelExtended = false; // Reset level extension flag
    
    // Reposition finish line deterministically far from start
    this.placeFinishLine();

    // Seed coins again
    this.seedCoins();

    // Snap player to nearest floor
    this.placePlayerOnGround();
  }

  restart() {
    this.startGame();
  }

  createCollisionMap() {
    var collisionMap = [];

    for (var i = 0; i < this.map.length; i++) {
      var block = this.map[i];

      var flag = 0;

      if (block) {
        var [x, y] = this.convertIndexToCoordinates(i);
        var top = this.map[this.convertCoordinatesToIndex(x, y - 1)];
        var bottom = this.map[this.convertCoordinatesToIndex(x, y + 1)];

        var left = this.map[this.convertCoordinatesToIndex(x - 1, y)];
        var right = this.map[this.convertCoordinatesToIndex(x + 1, y)];

        if (x !== 0) {
          flag |= !left ? 1 : 0;
        }
        if (x !== this.levelWidth - 1) {
          flag |= !right ? 2 : 0;
        }
        if (y !== 0) {
          flag |= !top ? 4 : 0;
        }
        if (y !== this.levelHeight - 1) {
          flag |= !bottom ? 8 : 0;
        }
      }

      collisionMap.push(flag);
    }

    return collisionMap;
  }

  getViewport() {
    return [this.canvas.width, this.canvas.height];
  }

  start() {
    this.inputManager.start();
    this.particleSystem.particles = [];

    this.camera.followingObject = this.player;
    this.sound.startBGM();
  }

  convertIndexToCoordinates(i) {
    return [i % this.levelWidth, Math.floor(i / this.levelWidth)];
  }

  convertCoordinatesToIndex(x, y) {
    return y * this.levelWidth + x;
  }

  renderGame(delta) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw simple background
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw level tiles as colored rectangles
    for (var i = 0; i < this.map.length; i++) {
      var block = this.map[i];
      if (block) {
        var [x, y] = this.convertIndexToCoordinates(i);
        this.render.drawRect(x, y, 1, 1, "#4a4a6a");
      }
    }

    // Removed on-screen FPS/timer display

    this.player.render(delta);
    for (var entityUUID in this.entities) {
      var entity = this.entities[entityUUID];

      entity.render(delta);
    }

    // Removed debug collision visualization for cleaner UI

    // Removed player collision debug visualization for cleaner UI

    this.particleSystem.render();

    // Render finish line
    if (this.finishLine) {
      this.finishLine.render();
    }
    
    // Draw guiding arrow
    this.arrow.render();

    // Render UI
    this.renderUI();

    // Render main menu
    if (this.gameState === 'menu') {
      if (this.menuState === 'main') {
        this.renderMainMenu();
      } else if (this.menuState === 'controls') {
        this.renderControlsMenu();
      } else if (this.menuState === 'sound') {
        this.renderSoundMenu();
      } else if (this.menuState === 'theme') {
        this.renderThemeMenu();
      }
    }
    
    // Render restart modals
    if (this.gameState === 'dead' || this.gameState === 'won') {
      // Semi-transparent background
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Modal box
      const modalWidth = 300;
      const modalHeight = 200;
      const modalX = (this.canvas.width - modalWidth) / 2;
      const modalY = (this.canvas.height - modalHeight) / 2;
      
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
      
      // Border
      this.ctx.strokeStyle = this.gameState === 'dead' ? "#FF0000" : "#00FF00";
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
      
      // Text
      this.ctx.fillStyle = this.gameState === 'dead' ? "#FF0000" : "#00FF00";
      this.ctx.font = "30px Readex Pro";
      this.ctx.textAlign = "center";
      this.ctx.fillText(this.gameState === 'dead' ? "GAME OVER" : "YOU WIN!", this.canvas.width / 2, modalY + 60);
      
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "20px Readex Pro";
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, modalY + 100);
      
      this.ctx.font = "16px Readex Pro";
      this.ctx.fillText("Press 'R' to restart", this.canvas.width / 2, modalY + 150);
      
      // Reset text alignment
      this.ctx.textAlign = "left";
      this.ctx.restore();
    }
  }

  renderUI() {
    // Save canvas state
    this.ctx.save();
    
    // Reset transform for UI rendering
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Soft background behind HUD
    this.ctx.globalAlpha = 0.35;
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(10, 10, 200, 60);
    this.ctx.globalAlpha = 1;

    // Draw score
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 20, 35);
    
    // Draw high score
    this.ctx.fillStyle = "#FFFF00";
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillText(`High Score: ${this.highScore}`, 20, 60);

    // Volume / Mute hint removed for cleaner UI
    
    // Draw game state messages
    if (this.gameState === 'dead') {
      this.ctx.fillStyle = "#FF0000";
      this.ctx.font = "40px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "20px Arial";
      this.ctx.fillText("Press R to restart", this.canvas.width / 2, this.canvas.height / 2 + 40);
    } else if (this.gameState === 'won') {
      this.ctx.fillStyle = "#00FF00";
      this.ctx.font = "40px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText("YOU WIN!", this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "20px Arial";
      this.ctx.fillText("Press R to restart", this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    // Reset text align
    this.ctx.textAlign = "left";
    
    // Restore canvas state
    this.ctx.restore();
  }

  // Draw main menu overlay and buttons
  renderMainMenu() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dim background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "bold 44px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Death Runner", this.canvas.width / 2, 140);

    // Messages
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Collect the coins, find the finish line", this.canvas.width / 2, 190);
    this.ctx.fillText("Sacrifice your player's life to end the game", this.canvas.width / 2, 220);
    this.ctx.fillText("Or give up by pressing Backspace", this.canvas.width / 2, 250);

    // Buttons positions (recomputed each frame; also used in update for hit test)
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.canvas.width / 2 - buttonWidth / 2;
    const startY = 320;
    const controlsY = startY + 70;
    const soundY = controlsY + 70;
    const themeY = soundY + 70;

    // Persist for click detection
    this.menuButtons = {
      start: { x: buttonX, y: startY, w: buttonWidth, h: buttonHeight },
      controls: { x: buttonX, y: controlsY, w: buttonWidth, h: buttonHeight },
      sound: { x: buttonX, y: soundY, w: buttonWidth, h: buttonHeight },
      theme: { x: buttonX, y: themeY, w: buttonWidth, h: buttonHeight },
    };

    // Start button
    this.ctx.fillStyle = "#2E7D32";
    this.ctx.fillRect(buttonX, startY, buttonWidth, buttonHeight);
    this.ctx.strokeStyle = "#4CAF50";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, startY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillText("START", this.canvas.width / 2, startY + 32);

    // Controls button
    this.ctx.fillStyle = "#1565C0";
    this.ctx.fillRect(buttonX, controlsY, buttonWidth, buttonHeight);
    this.ctx.strokeStyle = "#2196F3";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, controlsY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillText("CONTROLS", this.canvas.width / 2, controlsY + 32);

    // Sound button
    this.ctx.fillStyle = "#E65100";
    this.ctx.fillRect(buttonX, soundY, buttonWidth, buttonHeight);
    this.ctx.strokeStyle = "#FF9800";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, soundY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillText("SOUND", this.canvas.width / 2, soundY + 32);

    // Theme button
    this.ctx.fillStyle = "#6A1B9A";
    this.ctx.fillRect(buttonX, themeY, buttonWidth, buttonHeight);
    this.ctx.strokeStyle = "#9C27B0";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, themeY, buttonWidth, buttonHeight);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillText("THEME", this.canvas.width / 2, themeY + 32);

    // Keyboard hints - positioned better
    this.ctx.fillStyle = "#AAAAAA";
    this.ctx.font = "14px Arial";
    this.ctx.fillText("Press SPACE or ENTER to start", this.canvas.width / 2, themeY + 100);
    
    // Split hints into multiple lines for better readability
    this.ctx.fillText("1=START | 2=CONTROLS | 3=SOUND | 4=THEME", this.canvas.width / 2, themeY + 125);
    this.ctx.fillText("ESC=BACK | R=RESTART | BACKSPACE=QUIT", this.canvas.width / 2, themeY + 145);

    this.ctx.restore();
  }

  // Place player on the nearest floor directly below a given x
  placePlayerOnGround(x = this.player.x) {
    const px = Math.max(1, Math.min(this.levelWidth - 2, Math.floor(x)));
    // Scan from top to bottom to find first air with solid below
    for (let y = 1; y < this.levelHeight - 1; y++) {
      const air = !this.map[this.convertCoordinatesToIndex(px, y)];
      const solidBelow = !!this.map[this.convertCoordinatesToIndex(px, y + 1)];
      if (air && solidBelow) {
        this.player.x = px + 0.25;
        this.player.y = y + 1 - this.player.h; // stand on floor
        return;
      }
    }
    // Fallback: bottom
    this.player.y = this.levelHeight - this.player.h - 1;
  }

  // Draw controls menu
  renderControlsMenu() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dim background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("CONTROLS", this.canvas.width / 2, 100);

    // Controls list
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "left";
    
    const controls = [
      "W - Jump",
      "A - Move Left", 
      "S - Crouch",
      "D - Move Right",
      "D + S - Slide",
      "SPACE - Jump (Alternative)",
      "MOUSE CLICK - Attack",
      "F - Knockback",
      "G - Toggle Info",
      "R - Restart (when dead/won)",
      "M - Mute/Unmute",
      "+ / - - Volume Up/Down",
      "BACKSPACE - Give Up"
    ];

    let startY = 150;
    controls.forEach((control, index) => {
      this.ctx.fillText(control, 100, startY + index * 30);
    });

    // Back button
    const backButton = { x: 50, y: 50, w: 120, h: 40 };
    this.menuButtons = { back: backButton };
    
    this.ctx.fillStyle = "#666666";
    this.ctx.fillRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("BACK", backButton.x + backButton.w/2, backButton.y + 26);

    this.ctx.restore();
  }

  // Draw sound menu
  renderSoundMenu() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dim background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("SOUND SETTINGS", this.canvas.width / 2, 100);

    // Sound options
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "left";

    let startY = 150;

    // Volume control
    this.ctx.fillText("Volume:", 100, startY);
    const volume = this.sound && this.sound.masterGain ? this.sound.masterGain.gain.value : 0.5;
    this.ctx.fillText(`${Math.round(volume * 100)}%`, 300, startY);

    // Volume buttons
    const volDownButton = { x: 400, y: startY - 25, w: 40, h: 30 };
    const volUpButton = { x: 450, y: startY - 25, w: 40, h: 30 };
    
    this.ctx.fillStyle = "#FF6B6B";
    this.ctx.fillRect(volDownButton.x, volDownButton.y, volDownButton.w, volDownButton.h);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.strokeRect(volDownButton.x, volDownButton.y, volDownButton.w, volDownButton.h);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("-", volDownButton.x + volDownButton.w/2, volDownButton.y + 20);

    this.ctx.fillStyle = "#4ECDC4";
    this.ctx.fillRect(volUpButton.x, volUpButton.y, volUpButton.w, volUpButton.h);
    this.ctx.strokeRect(volUpButton.x, volUpButton.y, volUpButton.w, volUpButton.h);
    this.ctx.fillText("+", volUpButton.x + volUpButton.w/2, volUpButton.y + 20);

    // Mute toggle
    startY += 60;
    this.ctx.textAlign = "left";
    this.ctx.fillText("Mute:", 100, startY);
    const isMuted = this.sound && !this.sound.enabled;
    this.ctx.fillText(isMuted ? "ON" : "OFF", 300, startY);

    const muteButton = { x: 400, y: startY - 25, w: 60, h: 30 };
    this.ctx.fillStyle = isMuted ? "#FF6B6B" : "#4ECDC4";
    this.ctx.fillRect(muteButton.x, muteButton.y, muteButton.w, muteButton.h);
    this.ctx.strokeRect(muteButton.x, muteButton.y, muteButton.w, muteButton.h);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(isMuted ? "UNMUTE" : "MUTE", muteButton.x + muteButton.w/2, muteButton.y + 20);

    // Vibration mode (dummy)
    startY += 60;
    this.ctx.textAlign = "left";
    this.ctx.fillText("Vibration Mode:", 100, startY);
    this.ctx.fillText("ON (Dummy)", 300, startY);

    const vibButton = { x: 400, y: startY - 25, w: 80, h: 30 };
    this.ctx.fillStyle = "#FFD700";
    this.ctx.fillRect(vibButton.x, vibButton.y, vibButton.w, vibButton.h);
    this.ctx.strokeRect(vibButton.x, vibButton.y, vibButton.w, vibButton.h);
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "12px Arial";
    this.ctx.fillText("VIBRATE", vibButton.x + vibButton.w/2, vibButton.y + 20);

    // Back button
    const backButton = { x: 50, y: 50, w: 120, h: 40 };
    this.menuButtons = { 
      back: backButton, 
      volDown: volDownButton, 
      volUp: volUpButton, 
      mute: muteButton, 
      vibrate: vibButton 
    };
    
    this.ctx.fillStyle = "#666666";
    this.ctx.fillRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px Arial";
    this.ctx.fillText("BACK", backButton.x + backButton.w/2, backButton.y + 26);

    this.ctx.restore();
  }

  // Draw theme menu
  renderThemeMenu() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dim background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("PROJECT REFLECTION", this.canvas.width / 2, 80);

    // Subtitle
    this.ctx.fillStyle = "#9C27B0";
    this.ctx.font = "bold 24px Arial";
    this.ctx.fillText("Sacrifice Must Be Made", this.canvas.width / 2, 120);
    this.ctx.fillText("Cedar College Daydream Game Jam", this.canvas.width / 2, 150);

    // Content - centered and well-formatted
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "18px Arial";
    this.ctx.textAlign = "center";
    
    const content = [
      "For the theme \"Sacrifice must be made,\" I created a fast-paced runner game",
      "inspired by Vector. The player runs through a deadly course while dodging",
      "bullets and collecting coins, all while trying to beat the high score and",
      "reach the end of the level.",
      "",
      "There's no pop-up message or dialogue asking the player to make a choice,",
      "but the message is there in the gameplay: if you're brave enough to risk",
      "your character's life, you press play and take on the challenge. If not,",
      "you can simply quit. That decision — to stay safe or move forward — is",
      "the sacrifice.",
      "",
      "I built this game in just two days as a beginner, and while it's simple,",
      "it's also meaningful to me. I learned a lot, worked hard, and explored",
      "how a game can express a theme not just through story, but through",
      "gameplay itself.",
      "",
      "Thanks to Cedar College and the Daydream team for this opportunity",
      "and inspiring theme."
    ];

    let startY = 200;
    const lineHeight = 28;
    const maxWidth = this.canvas.width - 80;
    const centerX = this.canvas.width / 2;

    content.forEach((line, index) => {
      if (line === "") {
        startY += lineHeight;
        return;
      }
      
      // Word wrap for long lines and center them
      const words = line.split(' ');
      let currentLine = '';
      let y = startY + (index * lineHeight);
      
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          this.ctx.fillText(currentLine, centerX, y);
          currentLine = word + ' ';
          y += lineHeight;
        } else {
          currentLine = testLine;
        }
      });
      this.ctx.fillText(currentLine, centerX, y);
    });

    // Back button
    const backButton = { x: 50, y: 50, w: 120, h: 40 };
    this.menuButtons = { back: backButton };
    
    this.ctx.fillStyle = "#666666";
    this.ctx.fillRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(backButton.x, backButton.y, backButton.w, backButton.h);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("BACK", backButton.x + backButton.w/2, backButton.y + 26);

    this.ctx.restore();
  }

  placeFinishLine() {
    // Ensure finish line exists
    if (!this.finishLine) {
      this.finishLine = new FinishLine(this, 0, 0);
    }

    // Target far position (90% of current level width) - much further for challenge
    let targetX = Math.max(3, Math.floor(this.levelWidth * 0.9));

    // Snap to a nearby floor surface within ±6 tiles
    let placed = false;
    for (let dx = 0; dx <= 6 && !placed; dx++) {
      for (let sign of [1, -1]) {
        const x = Math.min(this.levelWidth - 2, Math.max(1, targetX + sign * dx));
        // Find the highest y such that air at (x,y) and solid at (x,y+1)
        for (let y = 1; y < this.levelHeight - 1; y++) {
          const air = !this.map[this.convertCoordinatesToIndex(x, y)];
          const solidBelow = !!this.map[this.convertCoordinatesToIndex(x, y + 1)];
          if (air && solidBelow) {
            // Position the finish line resting on this floor
            this.finishLine.x = x + 0.0; // align with tile edge
            this.finishLine.y = y + 1 - this.finishLine.h;
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }

    // Fallback: place at bottom-right margin if no floor detected
    if (!placed) {
      this.finishLine.x = Math.max(1, this.levelWidth - 2);
      this.finishLine.y = this.levelHeight - this.finishLine.h - 1;
    }
  }

  isSolid(x, y) {
    if (x < 0 || y < 0 || x >= this.levelWidth || y >= this.levelHeight) return false;
    return !!this.map[this.convertCoordinatesToIndex(x, y)];
  }

  seedCoins() {
    // Place coins throughout the level on all available floor surfaces
    let placed = 0;
    const maxCoins = 30; // Increased max coins
    
    // First place coins along the path to finish line
    const finishX = Math.floor(this.levelWidth * 0.9);
    
    // Place coins in groups along the entire level width
    for (let x = 1; x < this.levelWidth - 1; x++) {
      for (let y = 1; y < this.levelHeight - 1; y++) {
        // air tile with solid immediately below -> top surface
        if (!this.isSolid(x, y) && this.isSolid(x, y + 1)) {
          // Create coin patterns - more frequent near start and finish
          const distanceFromStart = Math.abs(x - 5);
          const distanceFromFinish = Math.abs(x - finishX);
          
          // Higher chance near start and finish, or every 2-3 blocks elsewhere
          if ((distanceFromStart < 10 && x % 2 === 0) || 
              (distanceFromFinish < 10 && x % 2 === 0) ||
              (x % 3 === 0 && Math.random() < 0.8)) {
            
            this.spawnCoin(x + 0.5, y - 0.1);
            placed++;
            
            // Create small coin clusters occasionally
            if (Math.random() < 0.3 && !this.isSolid(x+1, y) && this.isSolid(x+1, y+1)) {
              this.spawnCoin(x + 1.5, y - 0.1);
              placed++;
            }
            
            if (placed >= maxCoins) return;
          }
        }
      }
    }
  }

  updateGame(delta) {
    // Audio controls
    if (this.inputManager.isKeyPressed("m")) {
      if (this.sound) {
        this.sound.enabled = !this.sound.enabled;
        if (this.sound.enabled) {
          this.sound.startBGM();
        } else {
          this.sound.stopAll();
        }
      }
    }
    if (this.inputManager.isKeyPressed("+")) {
      if (this.sound && this.sound.masterGain) {
        this.sound.masterGain.gain.value = Math.min(1, this.sound.masterGain.gain.value + 0.05);
      }
    }
    if (this.inputManager.isKeyPressed("-")) {
      if (this.sound && this.sound.masterGain) {
        this.sound.masterGain.gain.value = Math.max(0, this.sound.masterGain.gain.value - 0.05);
      }
    }

    // Handle start game from menu
    if (this.gameState === 'menu' && (this.inputManager.isKeyPressed(" ") || this.inputManager.isKeyPressed("Enter"))) {
      this.startGame();
      return;
    }

    // Handle menu navigation with number keys
    if (this.gameState === 'menu') {
      if (this.inputManager.isKeyPressed("1")) {
        this.startGame();
        return;
      }
      if (this.inputManager.isKeyPressed("2")) {
        this.menuState = 'controls';
        return;
      }
      if (this.inputManager.isKeyPressed("3")) {
        this.menuState = 'sound';
        return;
      }
      if (this.inputManager.isKeyPressed("4")) {
        this.menuState = 'theme';
        return;
      }
      
      // Handle back navigation with Ctrl+Left, Escape, or Backspace
      if ((this.inputManager.isKeyPressed("Escape")) || 
          (this.inputManager.isKeyDown("Control") && this.inputManager.isKeyPressed("ArrowLeft")) ||
          (this.inputManager.isKeyPressed("Backspace"))) {
        if (this.menuState === 'controls' || this.menuState === 'sound' || this.menuState === 'theme') {
          this.menuState = 'main';
          return;
        }
      }
    }

    // Handle restart at any point with R
    if (this.inputManager.isKeyPressed("r") || this.inputManager.isKeyPressed("R")) {
      if (this.gameState === 'playing' || this.gameState === 'dead' || this.gameState === 'won') {
        this.restart();
        return;
      }
    }

    // Handle quit to main menu with Backspace at any point (except when in submenus)
    if (this.inputManager.isKeyPressed("Backspace")) {
      if ((this.gameState === 'playing' || this.gameState === 'dead' || this.gameState === 'won') ||
          (this.gameState === 'menu' && this.menuState === 'main')) {
        this.gameState = 'menu';
        this.menuState = 'main';
        this.sound && this.sound.stopBGM();
        return;
      }
    }
    // Handle menu mouse clicks
    if (this.gameState === 'menu' && this.inputManager.isMousePressed(0) && this.menuButtons) {
      const [mx, my] = this.inputManager.getMousePosition();
      console.log('Menu click detected at:', mx, my); // Debug
      
      // Main menu buttons
      if (this.menuState === 'main') {
        if (this.menuButtons.start) {
          const b = this.menuButtons.start;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            this.startGame();
            return;
          }
        }
        if (this.menuButtons.controls) {
          const b = this.menuButtons.controls;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            this.menuState = 'controls';
            return;
          }
        }
        if (this.menuButtons.sound) {
          const b = this.menuButtons.sound;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            this.menuState = 'sound';
            return;
          }
        }
        if (this.menuButtons.theme) {
          const b = this.menuButtons.theme;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            this.menuState = 'theme';
            return;
          }
        }
      }
      
      // Controls menu buttons
      if (this.menuState === 'controls' && this.menuButtons.back) {
        const b = this.menuButtons.back;
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          this.menuState = 'main';
          return;
        }
      }
      
      // Sound menu buttons
      if (this.menuState === 'sound') {
        if (this.menuButtons.back) {
          const b = this.menuButtons.back;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            this.menuState = 'main';
            return;
          }
        }
        if (this.menuButtons.volDown) {
          const b = this.menuButtons.volDown;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (this.sound && this.sound.masterGain) {
              this.sound.masterGain.gain.value = Math.max(0, this.sound.masterGain.gain.value - 0.1);
            }
            return;
          }
        }
        if (this.menuButtons.volUp) {
          const b = this.menuButtons.volUp;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (this.sound && this.sound.masterGain) {
              this.sound.masterGain.gain.value = Math.min(1, this.sound.masterGain.gain.value + 0.1);
            }
            return;
          }
        }
        if (this.menuButtons.mute) {
          const b = this.menuButtons.mute;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (this.sound) {
              this.sound.enabled = !this.sound.enabled;
              if (this.sound.enabled) {
                this.sound.startBGM();
              } else {
                this.sound.stopAll();
              }
            }
            return;
          }
        }
        if (this.menuButtons.vibrate) {
          const b = this.menuButtons.vibrate;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            // Dummy vibration - just play a sound effect
            if (this.sound) {
              this.sound.play('hit'); // Use existing sound as vibration feedback
            }
            return;
          }
        }
      }
    }

    // Only update game if playing
    if (this.gameState !== 'playing') {
      return;
    }


    // Remove FPS calculation (no on-screen timer)

    this.spawnTick += delta;
    if (this.spawnTick > 2) {
      this.spawnTick = 0;

      this.spawnEntity();
    }
    
    this.arrow.update(delta);
    
    // Count existing coins
    let coinCount = 0;
    for (let entityId in this.entities) {
      if (this.entities[entityId] instanceof Coin) {
        coinCount++;
      }
    }
    
    // Spawn coins more frequently on nearby floor (Mario style) if fewer than 15 coins exist
    if (coinCount < 15 && Math.random() < 0.1) {
      // Try to find a good position on a surface
      const x = this.player.x + getRandomInteger(-6, 8);
      let y = this.player.y;
      
      // Find a floor surface
      for (let testY = Math.floor(y); testY < Math.min(this.levelHeight - 1, Math.floor(y) + 5); testY++) {
        if (!this.isSolid(Math.floor(x), testY) && this.isSolid(Math.floor(x), testY + 1)) {
          this.spawnCoin(x, testY);
          break;
        }
      }
    }

    this.controller.update(delta);

    var deleteUUIDs = [];

    for (var entityUUID in this.entities) {
      var entity = this.entities[entityUUID];

      entity.update(delta);

      if (entity.delete) {
        deleteUUIDs.push(entityUUID);
      }
    }

    for (var entityUUID of deleteUUIDs) {
      delete this.entities[entityUUID];
    }

    this.player.update(delta);
    this.particleSystem.update(delta);
    this.camera.update(delta);

    // Update finish line
    if (this.finishLine) {
      this.finishLine.update(delta);
    }
  }
}
