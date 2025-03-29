import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateResultRegistrationDto {

    @ApiProperty()
    @IsNotEmpty()
    user: string;
    
    @ApiProperty()
    @IsNotEmpty()
    doctor: string;

    @ApiProperty()
    @IsNotEmpty()
    recordPatient: string;

    @ApiProperty()
    @IsNotEmpty()
    shiftSegment: string;

    @ApiProperty()
    @IsNotEmpty()
    medExamService: string;

    @ApiProperty()
    @IsNotEmpty()
    fee: number;

    @ApiProperty()
    description: string;


    
}