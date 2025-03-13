import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateShiftAssignmentDto {
    
    @ApiProperty()
    @IsNotEmpty()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    shiftId: string;

    @ApiProperty()
    @IsNotEmpty()
    doctorId: string | null;

}