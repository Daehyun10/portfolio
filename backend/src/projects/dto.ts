import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class TroubleDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) problem!: string;
  @IsString() @MinLength(1) solution!: string;
  @IsOptional() @IsInt() order?: number;
}

export class ProjectImageDto {
  @IsString() @MinLength(1) url!: string;
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsInt() order?: number;
}

export class CreateProjectDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug은 소문자, 숫자, 하이픈만 사용할 수 있습니다.' })
  slug!: string;

  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) summary!: string;
  @IsString() @MinLength(1) description!: string;

  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() period?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsInt() teamSize?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) stack?: string[];
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() published?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TroubleDto)
  troubles?: TroubleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectImageDto)
  images?: ProjectImageDto[];
}

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/)
  declare slug: string;

  @IsOptional() @IsString() declare title: string;
  @IsOptional() @IsString() declare summary: string;
  @IsOptional() @IsString() declare description: string;
}
