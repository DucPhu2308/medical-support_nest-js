import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    @ApiProperty()
    email: string;
    @IsNotEmpty()
    @ApiProperty()
    password: string;
    @IsNotEmpty()
    @ApiProperty()
    activeCode: string;
}