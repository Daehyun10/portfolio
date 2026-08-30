export interface Trouble {
  id: string;
  title: string;
  problem: string;
  solution: string;
  order: number;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  process: string | null;
  concerns: string | null;
  thumbnail: string | null;
  period: string | null;
  role: string | null;
  teamSize: number | null;
  stack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
  published: boolean;
  viewCount: number;
  troubles: Trouble[];
  images: ProjectImage[];
}

export interface AboutSection {
  id: string;
  title: string;
  body: string;
  order: number;
}

export type SkillLevel = 'EXPERT' | 'PROFICIENT' | 'ADVANCED' | 'BEGINNER';

/// 화면에 노출할 순서와 한글 이름. 서버 enum 값과 1:1로 맞춘다.
export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'EXPERT', label: '전문' },
  { value: 'ADVANCED', label: '고급' },
  { value: 'PROFICIENT', label: '숙련' },
  { value: 'BEGINNER', label: '초보' },
];

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  level: SkillLevel;
  order: number;
}

export interface About {
  id: string;
  headline: string;
  intro: string;
  email: string | null;
  githubUrl: string | null;
  sections: AboutSection[];
  skills: Skill[];
}
