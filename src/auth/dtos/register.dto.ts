import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class RegisterDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty()
    dob: Date;

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    gender: boolean;

    @ApiProperty()
    @IsNotEmpty()
    password: string;
}