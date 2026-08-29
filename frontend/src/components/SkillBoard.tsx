'use client';

import { useMemo, useState } from 'react';
import { SKILL_LEVELS, type Skill, type SkillLevel } from '@/lib/types';
import Editable from './Editable';

export default function SkillBoard({ skills }: { skills: Skill[] }) {
  const counts = useMemo(() => {
    const map = new Map<SkillLevel, number>();
    for (const skill of skills) map.set(skill.level, (map.get(skill.level) ?? 0) + 1);
    return map;
  }, [skills]);

  // 항목이 있는 첫 등급을 기본 선택으로 둔다.
  const [level, setLevel] = useState<SkillLevel>(
    () => SKILL_LEVELS.find((l) => skills.some((s) => s.level === l.value))?.value ?? 'EXPERT',
  );

  const visible = useMemo(() => skills.filter((s) => s.level === level), [skills, level]);

  // 분류가 없는 항목은 마지막에 "기타"로 모은다.
  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of visible) {
      const key = skill.category?.trim() || '기타';
      map.set(key, [...(map.get(key) ?? []), skill]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === '기타' ? 1 : b === '기타' ? -1 : 0));
  }, [visible]);

  if (skills.length === 0) return null;

  return (
    <section className="mt-16">
      <Editable id="about.skills.label" as="h2" className="block text-xs tracking-[0.2em] text-muted" />

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-3">
        {SKILL_LEVELS.map((tab) => {
          const count = counts.get(tab.value) ?? 0;
          const active = level === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setLevel(tab.value)}
              disabled={count === 0}
              aria-pressed={active}
              className={`text-sm transition-colors duration-150 disabled:opacity-35 ${
                active ? 'text-accent' : 'text-muted hover:text-fg'
              }`}
            >
              {tab.label}
              <span className="tnum ml-1.5 text-xs text-muted">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-sm text-muted">해당 숙련도로 등록된 항목이 없습니다.</p>
      ) : (
        <div>
          {groups.map(([category, items]) => (
            <div
              key={category}
              className="grid gap-x-8 gap-y-2 border-b border-line py-5 sm:grid-cols-[8rem_1fr]"
            >
              <h3 className="pt-0.5 text-xs tracking-[0.14em] text-muted">{category}</h3>

              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {items.map((skill) => (
                  <li key={skill.id} className="text-sm">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
