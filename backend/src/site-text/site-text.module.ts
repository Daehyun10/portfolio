import { Module } from '@nestjs/common';
import { SiteTextController } from './site-text.controller';
import { SiteTextService } from './site-text.service';

@Module({
  controllers: [SiteTextController],
  providers: [SiteTextService],
})
export class SiteTextModule {}
