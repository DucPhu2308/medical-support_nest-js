import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";

export class CreateMedExamHistoryDto {
    doctor: string;
    @ApiProperty()
    @IsNotEmpty()
    @Length(24, 24)
    recordPatient: string;
    @ApiProperty()
    @IsNotEmpty()
    symptoms: string;
    @ApiProperty()
    @IsNotEmpty()
    result: string;
    @ApiProperty()
    @IsNotEmpty()
    prescription: string;
}