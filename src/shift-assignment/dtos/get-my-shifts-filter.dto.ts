import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNumberString } from "class-validator";

export class GetMyShiftsFilterDto {
    @ApiProperty()
    @IsNumberString()
    month: number;

    @ApiProperty()
    @IsNumberString()
    year: number;
}