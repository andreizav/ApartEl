import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsOptional()
    @IsString()
    password?: string;
}
