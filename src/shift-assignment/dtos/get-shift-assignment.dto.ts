import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";




export class GetShiftAssignmentDto {
    @ApiProperty()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty()
    @IsNotEmpty()
    endDate: string;


}

