import GameObject from "./GameObject";

export default class Entity extends GameObject {
  constructor(game) {
    super(game);

    this.w = 0.1;
    this.h = 0.1;

    this.direction = -1;
    this.shootCooldown = 0;
    this.shootInterval = 2.5; // Shoot every ~2.5s
  }

  render() {
    this.game.render.drawRect(this.x, this.y, this.w, this.h, "#ff2222");
  }

  update(delta) {
    this.x += delta * this.direction * 3;

    super.update();

    // Update shoot cooldown
    this.shootCooldown += delta;

    // Shoot at player if cooldown is ready
    if (this.shootCooldown >= this.shootInterval) {
      this.shootCooldown = 0;
      this.shootAtPlayer();
    }

    if (this.collidesWith(this.game.player)) {
      if (this.game.player.animationName === "attack1") {
        this.direction = this.game.player.facing === 0 ? -1 : 1;

        this.game.particleSystem.spawnParticles(this.x, this.y, 6, 0.5);

        this.game.camera.shake();
      } else if (this.game.player.animationName === "ground_slam") {
        this.colliding = true;
        this.game.camera.shake();
      } else {
        this.game.player.facing = this.direction < 0 ? 1 : 0;

        this.game.player.knockback();
        this.colliding = true;
      }
    }

    if (this.colliding) {
      this.delete = true;

      this.game.particleSystem.spawnParticles(this.x, this.y, 5, 0.3);
    }
  }

  shootAtPlayer() {
    // Calculate direction to player
    const playerX = this.game.player.x + this.game.player.w / 2;
    const playerY = this.game.player.y + this.game.player.h / 2;
    const entityX = this.x + this.w / 2;
    const entityY = this.y + this.h / 2;
    
    const dx = playerX - entityX;
    const dy = playerY - entityY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const directionX = dx / distance;
      const directionY = dy / distance;
      this.game.spawnBullet(entityX, entityY, directionX, directionY);
    }
  }
}
