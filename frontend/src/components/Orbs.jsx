import { useEffect, useRef } from 'react';

// Ambient orbs with mouse parallax (15px x multiplier).
export default function Orbs() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      ref.current?.querySelectorAll('.orb').forEach((orb) => {
        const m = Number(orb.dataset.speed);
        orb.style.setProperty('--px', `${x * 15 * m}px`);
        orb.style.setProperty('--py', `${y * 15 * m}px`);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <div className="orbs" ref={ref} aria-hidden="true">
      <span className="orb orb-1" data-speed="2" />
      <span className="orb orb-2" data-speed="3" />
      <span className="orb orb-3" data-speed="1.5" />
    </div>
  );
}
