const KEYWORDS = [
  'GAME DEVELOPMENT',
  'FULL-STACK',
  'WEB & APP',
  'GAMEPLAY SYSTEMS',
  'PLAYER EXPERIENCE',
  'UI & UX',
  'BACKEND',
  'DATABASE',
  'API',
  'NETWORKING',
  'AI & AUTOMATION',
  'SYSTEM DESIGN',
  'PERFORMANCE',
  'PROBLEM SOLVING',
];

export default function Marquee() {
  // 끊김 없는 루프를 위해 같은 목록을 두 벌 이어 붙이고 절반만큼 이동시킨다.
  const loop = [...KEYWORDS, ...KEYWORDS];

  return (
    <div className="overflow-hidden border-y border-line py-3" aria-hidden>
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {loop.map((word, i) => (
              <span
                key={`${copy}-${i}`}
                className="px-5 text-sm tracking-[0.14em] text-muted sm:text-base"
              >
                {word}
                <span className="pl-5 text-line">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
