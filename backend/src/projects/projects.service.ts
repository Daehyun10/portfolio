import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(opts: { includeUnpublished?: boolean; featuredOnly?: boolean } = {}) {
    return this.prisma.project.findMany({
      where: {
        ...(opts.includeUnpublished ? {} : { published: true }),
        ...(opts.featuredOnly ? { featured: true } : {}),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        troubles: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findBySlug(slug: string, includeUnpublished = false) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        troubles: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
      },
    });
    if (!project || (!project.published && !includeUnpublished)) {
      throw new NotFoundException(`프로젝트를 찾을 수 없습니다: ${slug}`);
    }
    return project;
  }

  /// 상세 조회수는 응답을 막지 않도록 별도 엔드포인트로 분리해 증가시킨다.
  async incrementView(slug: string) {
    try {
      const { viewCount } = await this.prisma.project.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      });
      return { viewCount };
    } catch {
      throw new NotFoundException(`프로젝트를 찾을 수 없습니다: ${slug}`);
    }
  }

  async create(dto: CreateProjectDto) {
    const { troubles, images, steps, ...rest } = dto;
    try {
      return await this.prisma.project.create({
        data: {
          ...rest,
          troubles: troubles?.length
            ? { create: troubles.map((t, i) => ({ ...t, order: t.order ?? i })) }
            : undefined,
          images: images?.length
            ? { create: images.map((img, i) => ({ ...img, order: img.order ?? i })) }
            : undefined,
          steps: steps?.length
            ? { create: steps.map((st, i) => ({ ...st, order: st.order ?? i })) }
            : undefined,
        },
        include: {
        troubles: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
      },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`이미 존재하는 slug입니다: ${dto.slug}`);
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateProjectDto) {
    const { troubles, images, steps, ...rest } = dto;
    await this.ensureExists(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        // troubles가 넘어온 경우에만 통째로 교체한다 (부분 수정은 지원하지 않음).
        ...(troubles
          ? {
              troubles: {
                deleteMany: {},
                create: troubles.map((t, i) => ({ ...t, order: t.order ?? i })),
              },
            }
          : {}),
        // images 도 troubles 와 같이 넘어온 경우에만 통째로 교체한다.
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((img, i) => ({ ...img, order: img.order ?? i })),
              },
            }
          : {}),
        ...(steps
          ? {
              steps: {
                deleteMany: {},
                create: steps.map((st, i) => ({ ...st, order: st.order ?? i })),
              },
            }
          : {}),
      },
      include: {
        troubles: { orderBy: { order: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException(`프로젝트를 찾을 수 없습니다: ${id}`);
  }
}
