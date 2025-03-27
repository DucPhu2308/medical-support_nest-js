import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateRequestShiftChangeDto {
    
    @ApiProperty()
    @IsNotEmpty()
    currentShiftAssignmentId: string;

    @ApiProperty()
    @IsNotEmpty()
    currentDoctorId: string;

    @ApiProperty()
    @IsNotEmpty()
    newDoctorId: string;

    @ApiProperty()
    @IsNotEmpty()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    reason: string;
}