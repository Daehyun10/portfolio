import { API_URL } from './api';

/**
 * 화면에 나오는 고정 문구의 기본값.
 * DB에 같은 키의 값이 있으면 그쪽이 이기고, 없으면 여기 값이 쓰인다.
 * 새 문구를 편집 대상으로 만들려면 여기에 키를 추가하고 <Editable id="키" /> 로 쓰면 된다.
 */
export const SITE_TEXT_DEFAULTS = {
  'home.eyebrow': 'GAME DEVELOPER · PROGRAMMER',
  'home.headline.lead': '재미있는 경험',
  'home.headline.rest': '을 기술로 구현합니다.',
  'home.intro.1': '기능에서만 넘어가는 것이 아닌, 사용자의 경험을 생각하며 개발합니다.',
  'home.intro.2':
    'Project 페이지에는 직접 제작한 게임과 프로그래밍 프로젝트가 담겨 있습니다. 게임 시스템 설계부터 구현, 테스트와 개선까지의 과정과 그 안에서 해결한 문제들을 확인하실 수 있습니다.',
  'home.work.label': 'SELECTED WORK',
  'home.work.more': '전체 보기',
  'home.card.project.title': 'Project',
  'home.card.project.body': '프로젝트 소개, 해결 방법, 관련 공부 기록',
  'home.card.about.title': 'About',
  'home.card.about.body': '나의 경험과 생각, 개발자로서의 방향',

  'project.eyebrow': 'PROJECT',
  'project.headline': '만들면서 부딪힌 문제와 그 해결 과정',
  'project.empty': '아직 등록된 프로젝트가 없습니다.',

  'about.eyebrow': 'ABOUT',
  'about.skills.label': 'SKILLS',

  'footer.email': 'kdhyun081005@gmail.com',
  'footer.githubLabel': 'github.com/Daehyun10',
  'footer.githubUrl': 'https://github.com/Daehyun10',
  'footer.copyright': '김대현',
} as const;

export type SiteTextKey = keyof typeof SITE_TEXT_DEFAULTS;
export type SiteText = Record<string, string>;

/// 서버 컴포넌트에서 호출한다. 백엔드가 없으면 기본값만 돌려준다.
export async function getSiteText(): Promise<SiteText> {
  try {
    const res = await fetch(`${API_URL}/site-text`, {
      next: { revalidate: 60, tags: ['site-text'] },
    } as RequestInit);
    if (!res.ok) throw new Error(String(res.status));

    const stored = (await res.json()) as SiteText;
    return { ...SITE_TEXT_DEFAULTS, ...stored };
  } catch {
    return { ...SITE_TEXT_DEFAULTS };
  }
}
