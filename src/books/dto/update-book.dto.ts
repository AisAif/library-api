import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';
import { BookStatus } from '../books.entity';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status: BookStatus;

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
