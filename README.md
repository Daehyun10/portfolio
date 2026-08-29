# Portfolio

게임과 웹·앱 프로젝트를 정리한 개인 포트폴리오 사이트입니다.
만든 것과 그 과정에서 부딪힌 문제, 해결 방법을 함께 기록하는 것을 목표로 합니다.

## 화면

- **Home** — 소개와 대표 작업
- **Project** — 전체 작업 목록, 각 작업의 개요와 트러블슈팅
- **About** — 소개와 기술 스택 (숙련도별로 나눠 볼 수 있습니다)

## 기술 스택

**프론트엔드**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4

**백엔드**
- NestJS 11
- Prisma
- PostgreSQL

## 구조

```
portfolio/
├── backend/    REST API 서버
└── frontend/   웹 클라이언트
```

프론트엔드와 백엔드를 분리해, 화면과 데이터를 각각 독립적으로 배포하고 수정할 수 있게 했습니다.

## 구현 메모

- 공개 페이지는 서버 컴포넌트에서 데이터를 읽고 일정 주기로 갱신합니다. API가 응답하지 않아도 화면이 깨지지 않도록 기본값으로 렌더됩니다.
- 색·간격·타이포 값은 CSS 커스텀 프로퍼티 한곳에 모아두고, 페이지에서 임의의 값을 쓰지 않습니다.
- 화면에 보이는 문구는 코드에 고정하지 않고 API에서 받아, 코드 수정 없이 바꿀 수 있게 했습니다.

## 실행

```bash
cd backend && npm install && npm run start:dev
```

```bash
cd frontend && npm install && npm run dev
```

각 디렉터리의 `.env.example`을 참고해 환경 변수를 채운 뒤 실행합니다.
