import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AboutService } from './about.service';
import { UpsertAboutDto } from './dto';

@Controller('about')
export class AboutController {
  constructor(private readonly about: AboutService) {}

  @Get()
  find() {
    return this.about.find();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertAboutDto) {
    return this.about.upsert(dto);
  }
}
