import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSiteTextDto } from './dto';
import { SiteTextService } from './site-text.service';

@Controller('site-text')
export class SiteTextController {
  constructor(private readonly siteText: SiteTextService) {}

  @Get()
  findAll() {
    return this.siteText.findAll();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateSiteTextDto) {
    return this.siteText.update(dto.entries);
  }
}
