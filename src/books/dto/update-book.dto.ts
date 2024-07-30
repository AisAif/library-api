import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  summary: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  total_page: number;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  year: string;
}
