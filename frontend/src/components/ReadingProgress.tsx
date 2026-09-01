'use client';

import { useEffect, useState } from 'react';

/// 긴 상세 페이지에서 얼마나 읽었는지 알려주는 상단 2px 선.
export default function ReadingProgress() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setRatio(max > 0 ? window.scrollY / max : 0);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="reading-progress" style={{ width: `${(ratio * 100).toFixed(2)}%` }} aria-hidden />
  );
}
