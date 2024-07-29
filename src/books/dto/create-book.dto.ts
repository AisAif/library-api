import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  summary: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  total_page: number;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  year: string;
}
