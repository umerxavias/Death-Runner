import GameObject from "./GameObject";

export default class FinishLine extends GameObject {
  constructor(game, x, y) {
    super(game);
    
    this.x = x;
    this.y = y;
    this.w = 0.5; // Thin vertical collider
    this.h = 5; // Taller banner/goal-post
    this.animationTime = 0;
    this.checkSize = 0.25; // Size of each checker square
    this.flagWaveSpeed = 3; // Speed of flag waving animation
  }

  render() {
    // Draw pole
    this.game.render.drawRect(this.x, this.y, 0.2, this.h, "#FFFFFF");
    
    // Draw checkered flag (banner)
    const flagWidth = 2;
    const flagHeight = 2;
    const flagX = this.x + 0.2;
    const flagY = this.y;
    
    // Calculate wave offset for animation
    const waveOffset = Math.sin(this.animationTime * this.flagWaveSpeed) * 0.1;
    
    // Draw checkered pattern (black and white)
    const checkerRows = Math.ceil(flagHeight / this.checkSize);
    const checkerCols = Math.ceil(flagWidth / this.checkSize);
    
    for (let row = 0; row < checkerRows; row++) {
      for (let col = 0; col < checkerCols; col++) {
        const isEven = (row + col) % 2 === 0;
        const color = isEven ? "#FFFFFF" : "#000000";
        
        // Apply wave effect to x position
        const waveX = flagX + col * this.checkSize + waveOffset * (row / checkerRows);
        
        this.game.render.drawRect(
          waveX,
          flagY + row * this.checkSize,
          this.checkSize,
          this.checkSize,
          color
        );
      }
    }
    
    // Draw top ornament
    this.game.render.drawRect(this.x - 0.1, this.y - 0.3, 0.4, 0.3, "#FFD700"); // Gold top
  }

  update(delta) {
    this.animationTime += delta;
    
    // Check if player reaches finish line
    if (this.collidesWith(this.game.player)) {
      this.game.gameWin();
      
      // Spawn celebration particles
      this.game.particleSystem.spawnParticles(
        this.x + this.w / 2,
        this.y + this.h / 2,
        20,
        1.0,
        "#FFD700" // Gold particles
      );
    }
  }
}
