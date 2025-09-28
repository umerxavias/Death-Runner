export default class Arrow {
  constructor(game) {
    this.game = game;
    this.visible = true;
    this.blink = 0;
  }

  update(delta) {
    this.blink += delta * 2;
  }

  render() {
    const finish = this.game.finishLine;
    if (!finish) return;

    // Vector from player to finish line center
    const px = this.game.player.x + this.game.player.w / 2;
    const py = this.game.player.y + this.game.player.h / 2;
    const fx = finish.x + finish.w / 2;
    const fy = finish.y + finish.h / 2;

    const dx = fx - px;
    const dy = fy - py;
    const dist = Math.hypot(dx, dy); // Use full distance for accuracy

    // Hide when very close
    if (dist < 3) return;

    // Arrow anchor slightly above player
    const ax = px;
    const ay = this.game.player.y - 0.6;

    // Direction unit
    const ux = dx / (dist || 1);
    const uy = dy / (dist || 1);

    // Arrow length and width in world units
    const length = 1.2;
    const width = 0.35;

    // Points for a simple triangle arrow
    const tipX = ax + ux * length;
    const tipY = ay + uy * length;
    // Perpendicular
    const pxn = -uy;
    const pyn = ux;
    const baseX = ax + ux * (length * 0.55);
    const baseY = ay + uy * (length * 0.55);
    const leftX = baseX + pxn * width * 0.5;
    const leftY = baseY + pyn * width * 0.5;
    const rightX = baseX - pxn * width * 0.5;
    const rightY = baseY - pyn * width * 0.5;

    // Color pulsing
    const alpha = 0.6 + 0.3 * Math.abs(Math.sin(this.blink));
    this.game.ctx.save();
    this.game.ctx.globalAlpha = alpha;

    // Draw filled triangle in camera space
    const ctx = this.game.ctx;
    const [tix, tiy] = this.game.camera.transformCoordinates(tipX, tipY);
    const [lx, ly] = this.game.camera.transformCoordinates(leftX, leftY);
    const [rx, ry] = this.game.camera.transformCoordinates(rightX, rightY);

    ctx.beginPath();
    ctx.moveTo(tix, tiy);
    ctx.lineTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.closePath();
    ctx.fillStyle = "#00E5FF";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#003A66";
    ctx.stroke();

    // Distance label above arrow (optional subtle)
    const [labelX, labelY] = this.game.camera.transformCoordinates(ax, ay - 0.2);
    ctx.globalAlpha = 0.8;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#D9F7FF";
    ctx.textAlign = "center";
    ctx.fillText(Math.ceil(dist) + "m", labelX, labelY);

    ctx.restore();
  }
}