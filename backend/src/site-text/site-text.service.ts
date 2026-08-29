import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SiteTextEntryDto } from './dto';

@Injectable()
export class SiteTextService {
  constructor(private readonly prisma: PrismaService) {}

  /// 프론트에서 바로 쓰도록 배열이 아니라 객체로 돌려준다.
  async findAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteText.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async update(entries: SiteTextEntryDto[]) {
    await this.prisma.$transaction(
      entries.map(({ key, value }) =>
        this.prisma.siteText.upsert({ where: { key }, create: { key, value }, update: { value } }),
      ),
    );
    return this.findAll();
  }
}
