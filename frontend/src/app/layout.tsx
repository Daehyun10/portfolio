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
  title: '이름 | 프론트엔드 개발자 포트폴리오',
  description: '프로젝트와 문제 해결 과정을 기록한 포트폴리오입니다.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 편집 대상 문구를 한 번만 읽어 모든 화면에서 함께 쓴다.
  const [text, about] = await Promise.all([getSiteText(), getAbout()]);

  return (
    <html lang="ko" className={`${display.variable} ${sans.variable}`}>
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
