import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class ShiftChangeDataDto {
    @ApiProperty()
    @IsNotEmpty()
    shiftAssignmentId: string;

    @ApiProperty()
    @IsNotEmpty()
    currentDoctorId: string;

    @ApiProperty()
    @IsNotEmpty()
    newDoctorId: string;

    @ApiProperty()
    @IsNotEmpty()
    date: string;

}