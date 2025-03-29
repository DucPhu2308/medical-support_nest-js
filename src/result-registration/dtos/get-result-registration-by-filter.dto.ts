import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class GetResultRegistrationByFilterDto {
    @ApiProperty()
    doctor: string;

    @ApiProperty()
    startDate: string;

    @ApiProperty()
    endDate: string;

    @ApiProperty()
    status: string;
}
