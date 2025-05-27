import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAreaDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  id: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  descripcion: string;
}
