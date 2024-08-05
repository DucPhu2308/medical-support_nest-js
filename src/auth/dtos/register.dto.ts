import { IsDateString, IsEmail, IsNotEmpty } from "class-validator";

export class RegisterDto {
    firstName: string;
    lastName: string;
    @IsEmail()
    email: string;
    @IsDateString()
    dob: Date;
    @IsNotEmpty()
    password: string;
}