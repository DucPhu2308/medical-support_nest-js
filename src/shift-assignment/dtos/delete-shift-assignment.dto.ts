import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";




export class DeleteShiftAssignmentDto {

    @ApiProperty()
    month: number;

    @ApiProperty()
    year: number;

}