import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export enum SkillLevel {
  EXPERT = 'EXPERT',
  PROFICIENT = 'PROFICIENT',
  ADVANCED = 'ADVANCED',
  BEGINNER = 'BEGINNER',
}

export class SkillDto {
  @IsString() @MinLength(1) name!: string;
  @IsEnum(SkillLevel) level!: SkillLevel;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() order?: number;
}

export class AboutSectionDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) body!: string;
  @IsOptional() @IsInt() order?: number;
}

export class UpsertAboutDto {
  @IsString() @MinLength(1) headline!: string;
  @IsString() @MinLength(1) intro!: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() githubUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutSectionDto)
  sections?: AboutSectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}
