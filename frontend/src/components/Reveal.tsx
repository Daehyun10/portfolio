'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 화면에 들어오면 한 번만 부드럽게 나타난다.
 * 실제 숨김/보임은 CSS 가 담당하고, 여기서는 클래스만 붙인다.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /// 목록에서 순차적으로 나타나게 할 때만 쓴다. 200ms 를 넘기지 않는 것이 좋다.
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 이미 화면 안에 있으면 관찰 없이 바로 보여준다.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
