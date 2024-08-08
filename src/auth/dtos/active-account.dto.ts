import { IsEmail, Matches } from "class-validator";

export class ActiveAccountDto {
    @IsEmail()
    email: string;
    
    // activeCode is a string of 6 digits
    @Matches(/^[0-9]{6}$/)
    activeCode: string;
}