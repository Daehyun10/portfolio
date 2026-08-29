import { Type } from 'class-transformer';
import { IsArray, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class SiteTextEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  key!: string;

  @IsString()
  @MaxLength(4000)
  value!: string;
}

export class UpdateSiteTextDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteTextEntryDto)
  entries!: SiteTextEntryDto[];
}
