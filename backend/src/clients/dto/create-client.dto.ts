import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClientDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
