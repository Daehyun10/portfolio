import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin1234';

  // .env 의 비밀번호를 항상 반영한다. 계정이 이미 있어도 비밀번호를 갱신한다.
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed, name: '관리자' },
  });

  await prisma.about.upsert({
    where: { id: 'about' },
    update: {},
    create: {
      id: 'about',
      headline: '아이디어를 현실로 만들고자 도전하는 개발자입니다.',
      intro:
        '사용자의 입장에서 항상 바라보며 최적의 방안을 생각해내고, 게임의 재미부터 웹과 앱의 사용성까지 목적에 맞는 기술을 선택하고 직접 구현하는 과정을 지향합니다.',
      email: 'kdhyun081005@gmail.com',
      githubUrl: 'https://github.com/Daehyun10',
      skills: {
        create: [
          { name: 'Unity', category: '엔진 · 도구', level: 'EXPERT', order: 0 },
          { name: 'C#', category: '언어', level: 'EXPERT', order: 1 },
          { name: 'JavaScript', category: '언어', level: 'EXPERT', order: 2 },
          { name: 'TypeScript', category: '언어', level: 'EXPERT', order: 3 },
          { name: 'Python', category: '언어', level: 'EXPERT', order: 4 },
          { name: 'HTML', category: '마크업 · 스타일', level: 'EXPERT', order: 5 },
          { name: 'CSS', category: '마크업 · 스타일', level: 'EXPERT', order: 6 },
          { name: 'Godot', category: '엔진 · 도구', level: 'ADVANCED', order: 7 },
          { name: 'GameMaker Studio', category: '엔진 · 도구', level: 'ADVANCED', order: 8 },
          { name: 'Swift', category: '언어', level: 'ADVANCED', order: 9 },
          { name: 'Rust', category: '언어', level: 'ADVANCED', order: 10 },
          { name: 'Ruby', category: '언어', level: 'ADVANCED', order: 11 },
          { name: 'Unreal Engine', category: '엔진 · 도구', level: 'PROFICIENT', order: 12 },
          { name: 'Java', category: '언어', level: 'PROFICIENT', order: 13 },
          { name: 'C++', category: '언어', level: 'PROFICIENT', order: 14 },
          { name: 'Node.js', category: '프레임워크 · 런타임', level: 'PROFICIENT', order: 15 },
          { name: 'React', category: '프레임워크 · 런타임', level: 'PROFICIENT', order: 16 },
          { name: 'Next.js', category: '프레임워크 · 런타임', level: 'PROFICIENT', order: 17 },
          { name: 'SQL', category: '데이터', level: 'PROFICIENT', order: 18 },
          { name: 'Photoshop', category: '디자인 · 영상', level: 'PROFICIENT', order: 19 },
          { name: 'Premiere Pro', category: '디자인 · 영상', level: 'PROFICIENT', order: 20 },
          { name: 'Blender', category: '디자인 · 영상', level: 'PROFICIENT', order: 21 },
          { name: 'PHP', category: '언어', level: 'BEGINNER', order: 22 },
          { name: 'Go', category: '언어', level: 'BEGINNER', order: 23 },
          { name: 'Kotlin', category: '언어', level: 'BEGINNER', order: 24 },
          { name: 'Express', category: '프레임워크 · 런타임', level: 'BEGINNER', order: 25 },
          { name: 'NestJS', category: '프레임워크 · 런타임', level: 'BEGINNER', order: 26 },
        ],
      },
      sections: {
        create: [
          { title: '해온 일', body: '게임 개발을 중심으로 웹·앱, 풀스택 서비스, AI, 알고리즘, 네트워크 등 다양한 시스템을 직접 설계하고 구현해왔습니다.\n개인 프로젝트를 통해 실제 사용자를 위한 개발을 경험하며, 아이디어를 프로토타입으로 만들고 테스트와 피드백을 통해 완성도를 높이는 과정을 반복해왔습니다.', order: 0 },
          { title: '작업 방식', body: '먼저 해결해야 할 문제와 사용자의 경험을 정의합니다.\n그다음 필요한 시스템을 설계하고 구현한 뒤, 직접 플레이하거나 사용해보며 문제를 찾습니다. 동작만 하는 것에서 끝나지 않고 성능, 사용성, 재미와 안정성을 계속 개선하는 것을 중요하게 생각합니다.', order: 1 },
          { title: '앞으로', body: '게임과 다양한 소프트웨어를 만들며 더 좋은 경험을 설계하는 개발자가 되고 싶습니다.\n새로운 기술을 사용하는 것 자체보다 그것을 어디에, 왜 사용해야 하는지를 고민하고, 아이디어를 실제 사람들이 사용할 수 있는 결과물로 계속 만들어가고 싶습니다.', order: 2 },
        ],
      },
    },
  });

  // 프로젝트는 /project 화면의 추가 버튼이나 /admin 에서 직접 등록한다.
  // 형식은 아래와 같다.
  //
  // {
  //   slug: 'my-game',                       // 주소에 쓰임. 소문자·숫자·하이픈
  //   title: '제목',
  //   summary: '한 줄 요약',
  //   description: '개요. 줄바꿈은 \n',
  //   period: '2025.01 - 2025.03',
  //   role: '기획 · 개발',
  //   teamSize: 3,
  //   stack: ['Unity', 'C#'],
  //   githubUrl: 'https://github.com/...',
  //   liveUrl: 'https://...',
  //   featured: true,                        // 첫 화면 노출
  //   order: 0,
  //   troubles: {
  //     create: [{ title: '문제 제목', problem: '무엇이 문제였는지', solution: '어떻게 풀었는지', order: 0 }],
  //   },
  // }
  const projects: Prisma.ProjectCreateInput[] = [];

  for (const p of projects) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  // 비밀번호는 절대 출력하지 않는다. 터미널 기록과 CI 로그에 남는다.
  console.log(`시드 완료. 관리자 계정: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
