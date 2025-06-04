import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  coverImageURL?: string;
}
