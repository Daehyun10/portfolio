import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAboutDto } from './dto';

const ABOUT_ID = 'about';

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const about = await this.prisma.about.findUnique({
      where: { id: ABOUT_ID },
      include: { sections: { orderBy: { order: 'asc' } }, skills: { orderBy: { order: 'asc' } } },
    });
    if (!about) throw new NotFoundException('About 내용이 아직 등록되지 않았습니다.');
    return about;
  }

  /// About은 단일 문서라 생성/수정을 하나의 upsert로 처리한다.
  async upsert(dto: UpsertAboutDto) {
    const { sections, skills, ...rest } = dto;
    const sectionData = (sections ?? []).map((s, i) => ({ ...s, order: s.order ?? i }));
    const skillData = (skills ?? []).map((s, i) => ({ ...s, order: s.order ?? i }));

    return this.prisma.about.upsert({
      where: { id: ABOUT_ID },
      create: { id: ABOUT_ID, ...rest, sections: { create: sectionData }, skills: { create: skillData } },
      update: {
        ...rest,
        ...(sections ? { sections: { deleteMany: {}, create: sectionData } } : {}),
        ...(skills ? { skills: { deleteMany: {}, create: skillData } } : {}),
      },
      include: { sections: { orderBy: { order: 'asc' } }, skills: { orderBy: { order: 'asc' } } },
    });
  }
}
