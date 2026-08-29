import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageService } from './storage.service';

const ALLOWED = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      // 서버리스에는 쓸 수 있는 디스크가 없으므로 메모리로 받아 Supabase로 넘긴다.
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED.includes(ext)) {
          return cb(new BadRequestException(`허용되지 않는 확장자입니다: ${ext}`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('업로드할 파일이 없습니다.');

    const path = `projects/${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    try {
      const url = await this.storage.upload(path, file.buffer, file.mimetype);
      return { path, url, size: file.size };
    } catch (e) {
      throw new InternalServerErrorException(
        e instanceof Error ? e.message : '이미지 업로드에 실패했습니다.',
      );
    }
  }
}
