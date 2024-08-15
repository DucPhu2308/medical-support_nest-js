import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Matches } from "class-validator";

export class ActiveAccountDto {
    @IsEmail()
    @ApiProperty()
    email: string;
    
    // activeCode is a string of 6 digits
    @Matches(/^[0-9]{6}$/)
    @ApiProperty()
    activeCode: string;
}