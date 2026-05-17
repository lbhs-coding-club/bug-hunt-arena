import { useEffect, useRef } from 'react';

const glyphs = '01{}[]<>/;:=+-LBHSCODEBUG';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let animationFrame = 0;
    let columns = [];
    const fontSize = 16;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.ceil(window.innerWidth / fontSize);
      columns = Array.from({ length: count }, () => Math.random() * window.innerHeight);
    }

    function draw() {
      context.fillStyle = 'rgba(0, 0, 0, 0.12)';
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = 'rgba(52, 255, 119, 0.34)';
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;

      columns.forEach((y, index) => {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = index * fontSize;
        context.fillText(text, x, y);
        columns[index] = y > window.innerHeight + Math.random() * 900 ? 0 : y + fontSize;
      });

      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    if (reduceMotion) {
      context.fillStyle = 'rgba(52, 255, 119, 0.08)';
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;
      context.fillText('LBHS CODING CLUB', 24, 40);
      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />;
}
