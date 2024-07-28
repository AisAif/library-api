import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.password)
  @IsNotEmpty()
  password_confirm: string;
}
