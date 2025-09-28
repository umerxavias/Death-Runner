import GameObject from "./GameObject";

export default class Bullet extends GameObject {
  constructor(game, x, y, directionX, directionY = 0) {
    super(game);
    
    this.x = x;
    this.y = y;
    this.w = 0.1;
    this.h = 0.1;
    this.dx = directionX;
    this.dy = directionY;
    this.speed = 5; // slower so you can see and dodge
    this.lifeTime = 3; // Bullet disappears after 3 seconds
    this.age = 0;
  }

  render() {
    // Draw a small bullet
    this.game.ctx.save();
    this.game.ctx.fillStyle = "#FF0000";
    this.game.ctx.fillRect(this.x, this.y, this.w, this.h);
    this.game.ctx.restore();
  }

  update(delta) {
    // Move bullet
    this.x += this.dx * this.speed * delta;
    this.y += this.dy * this.speed * delta;
    
    // Age the bullet
    this.age += delta;
    if (this.age >= this.lifeTime) {
      this.delete = true;
      return;
    }
    
    // Check collision with player - using more precise collision detection
    if (this.game.gameState === 'playing' && this.collidesWith(this.game.player)) {
      // Get the actual overlap side for more precise collision
      const side = this.calculateOverlap(this.game.player);
      
      // Only process collision if there's a real overlap and player isn't invulnerable
      if (side !== "none") {
        // Health-based damage: 1 per bullet, then brief i-frames
        if (!this.game.player.invulnerable) {
          this.game.player.health = Math.max(0, this.game.player.health - 1);
          this.game.player.invulnerable = true;
          this.game.player.invulnerableTimer = 0;

          this.game.sound && this.game.sound.playHit();
          this.game.camera.shake(0.2, 0.6);
          this.game.particleSystem.spawnParticles(
            this.x + this.w/2,
            this.y + this.h/2,
            10,
            0.5,
            "#FF0000"
          );

          if (this.game.player.health <= 0) {
            this.game.playerDie();
          }
        }

        this.delete = true;
      }
    }
    
    // Check if bullet is out of bounds
    if (this.x < 0 || this.x > this.game.levelWidth || 
        this.y < 0 || this.y > this.game.levelHeight) {
      this.delete = true;
    }
  }
}
