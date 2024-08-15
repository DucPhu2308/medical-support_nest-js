import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty } from "class-validator";

export class RegisterDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsDateString()
    @ApiProperty()
    dob: Date;

    @IsBoolean()
    @ApiProperty()
    gender: boolean;

    @ApiProperty()
    @IsNotEmpty()
    password: string;
}