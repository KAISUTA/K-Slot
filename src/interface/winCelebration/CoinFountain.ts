const PALETTE = [
  '#fff2a6',
  '#ffe45c',
  '#ffd43b',
  '#ffc400',
  '#f7b500',
  '#e6a400',
  '#d99000',
];
const MEGA_PALETTE = [...PALETTE, '#fff6c9', '#ffdf6e', '#f5c542', '#c98300'];

type CoinParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  rotV: number;
  life: number;
  decay: number;
  col: string;
};

class CoinFountain {
  private readonly cvs: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly lowPower: boolean;
  private coins: CoinParticle[] = [];
  private raf: number | null = null;
  private readonly resizeHandler = () => this.resize();

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Coin fountain canvas is missing a 2D context.');
    }

    this.cvs = canvas;
    this.ctx = context;
    this.lowPower =
      window.innerWidth <= 768 ||
      window.matchMedia('(pointer: coarse)').matches;
    this.resize();
    window.addEventListener('resize', this.resizeHandler);
    this.loop();
  }

  resize() {
    const dpr = this.lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this.cvs.width = Math.floor(window.innerWidth * dpr);
    this.cvs.height = Math.floor(window.innerHeight * dpr);
    this.cvs.style.width = `${window.innerWidth}px`;
    this.cvs.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  spawn(count = 60, mega = false) {
    const palette = mega ? MEGA_PALETTE : PALETTE;
    const particleCount = this.lowPower
      ? Math.min(count, mega ? 64 : 44)
      : count;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (mega ? 1.5 : 0.9);
      const spd =
        (mega ? 16 : 10) +
        Math.random() * (mega ? 14 : 8) * (this.lowPower ? 0.8 : 1);
      this.coins.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (mega ? 3 : 1.5),
        r:
          (mega ? 9 + Math.random() * 6 : 6 + Math.random() * 5) *
          (this.lowPower ? 0.88 : 1),
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.28,
        life: 1,
        decay: 0.01 + Math.random() * 0.009,
        col: palette[Math.floor(Math.random() * palette.length)],
      });
    }
  }

  destroy() {
    if (this.raf !== null) {
      cancelAnimationFrame(this.raf);
    }
    window.removeEventListener('resize', this.resizeHandler);
    this.coins = [];
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }

  private loop() {
    const ctx = this.ctx;
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    this.coins = this.coins.filter(
      (coin) => coin.life > 0 && coin.y < height + 80,
    );
    this.coins.forEach((coin) => {
      coin.vy += 0.52;
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.vx *= 0.991;
      coin.rot += coin.rotV;
      coin.life -= coin.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, coin.life);
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rot);

      const squash = Math.abs(Math.cos(coin.rot * 0.6));
      ctx.scale(squash || 0.05, 1);

      ctx.beginPath();
      ctx.arc(0, 0, coin.r, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        -coin.r * 0.3,
        -coin.r * 0.35,
        0,
        0,
        0,
        coin.r,
      );
      gradient.addColorStop(0, '#fffacc');
      gradient.addColorStop(0.5, coin.col);
      gradient.addColorStop(1, '#7a4400');
      ctx.fillStyle = gradient;
      ctx.shadowColor = coin.col;
      ctx.shadowBlur = this.lowPower ? 3 : 7;
      ctx.fill();
      ctx.strokeStyle = '#b87000';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (coin.r > 8) {
        ctx.fillStyle = 'rgba(80,35,0,0.65)';
        ctx.font = `bold ${Math.floor(coin.r * 1.05)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('$', 0, 0);
      }

      ctx.restore();
    });

    this.raf = requestAnimationFrame(() => this.loop());
  }
}

export default CoinFountain;
