import GameObject from "./GameObject";

export default class Coin extends GameObject {
  constructor(game) {
    super(game);

    this.w = 0.25;
    this.h = 0.25;
    this.value = 10;
    this.rotation = 0;
    this.collected = false;
    this.collectAnimation = 0;
  }

  render() {
    // Mario-style coin laying flat on the ground
    const [tx, ty, tw, th] = this.game.camera.transformRect(this.x, this.y, this.w, this.h);

    const ctx = this.game.ctx;
    ctx.save();

    if (this.collected) {
      // Collection animation - just show particles
      ctx.restore();
      return;
    }

    // Draw soft shadow under coin
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000";
    const shadowW = tw * 0.8;
    const shadowH = Math.max(2, th * 0.15);
    ctx.beginPath();
    ctx.ellipse(tx + tw / 2, ty + th - shadowH/2, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Coin body (gold) - flat on ground like Mario coins
    ctx.beginPath();
    // Make it look like it's laying flat by using an ellipse with small height
    ctx.ellipse(tx + tw / 2, ty + th - th/4, tw * 0.4, th * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    
    // Rim
    ctx.lineWidth = Math.max(1, tw * 0.04);
    ctx.strokeStyle = "#B8860B";
    ctx.stroke();

    // Shine detail
    ctx.beginPath();
    ctx.ellipse(tx + tw / 2, ty + th - th/4, tw * 0.25, th * 0.08, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFF4BF";
    ctx.stroke();

    ctx.restore();
  }

  update(delta) {
    // Check collision with player
    if (this.collidesWith(this.game.player) && !this.collected) {
      this.collected = true;
      this.game.addScore(this.value);
      this.game.sound && this.game.sound.playCoin();
      
      // Spawn more particles for better collection effect
      this.game.particleSystem.spawnParticles(
        this.x + this.w/2, 
        this.y + this.h/2, 
        15, // More particles
        0.7, // Larger particles
        "#FFD700" // Gold color
      );
      
      // Instant removal
      this.delete = true;
    }
  }
}
