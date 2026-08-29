import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { AboutModule } from './about/about.module';
import { UploadModule } from './upload/upload.module';
import { SiteTextModule } from './site-text/site-text.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    AboutModule,
    UploadModule,
    SiteTextModule,
  ],
})
export class AppModule {}
