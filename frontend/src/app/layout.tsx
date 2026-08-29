import type { Metadata } from 'next';
import { Hahmlet, IBM_Plex_Sans_KR } from 'next/font/google';
import Dock from '@/components/Dock';
import EditModeProvider from '@/components/EditModeProvider';
import EditToolbar from '@/components/EditToolbar';
import { getAbout } from '@/lib/api';
import { getSiteText } from '@/lib/site-text';
import './globals.css';

// 제목은 세리프, 본문은 산세리프로 나눠 위계를 굵기가 아닌 서체로 만든다.
const display = Hahmlet({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const sans = IBM_Plex_Sans_KR({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: '김대현 | 게임 개발자 포트폴리오',
  description: '직접 만든 게임과 프로그래밍 프로젝트, 그 과정에서 해결한 문제를 기록한 포트폴리오입니다.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 편집 대상 문구를 한 번만 읽어 모든 화면에서 함께 쓴다.
  const [text, about] = await Promise.all([getSiteText(), getAbout()]);

  return (
    <html
      lang="ko"
      className={`${display.variable} ${sans.variable}`}
      /* 인라인 스크립트가 data-js 를 먼저 붙이므로 속성 차이 검사를 끈다. */
      suppressHydrationWarning
    >
      <head>
        {/* 스크롤 등장 효과는 JS 가 있을 때만 켠다. 없으면 내용이 그대로 보인다. */}
        <script
          dangerouslySetInnerHTML={{
            // className 을 건드리면 React 가 관리하는 값과 어긋나 하이드레이션 경고가 난다.
            // React 가 렌더하지 않는 속성을 써서 충돌을 피한다.
            __html: "document.documentElement.setAttribute('data-js','')",
          }}
        />
      </head>
      <body>
        <EditModeProvider text={text} about={about}>
          {children}
          <Dock />
          <EditToolbar />
        </EditModeProvider>
      </body>
    </html>
  );
}
