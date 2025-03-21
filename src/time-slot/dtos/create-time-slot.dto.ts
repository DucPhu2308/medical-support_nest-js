import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateTimeSlotDto {
    @ApiProperty()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty()
    @IsNotEmpty()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    maxRegistrations: number;
}

