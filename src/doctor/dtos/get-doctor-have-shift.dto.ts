import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class GetDoctorHaveShiftDto {
    @ApiProperty()
    @IsNotEmpty()
    day : number;

    @ApiProperty()
    @IsNotEmpty()
    month : number;

    @ApiProperty()
    @IsNotEmpty()
    year : number;

    @ApiProperty()
    specialtyId : string;
}