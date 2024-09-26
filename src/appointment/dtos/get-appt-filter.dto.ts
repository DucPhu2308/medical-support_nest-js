import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export class GetApptFilterDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    q?: string;
    @IsOptional()
    @IsNumber()
    @Transform(({value}) => parseInt(value))
    @ApiPropertyOptional()
    month?: number;
    @IsOptional()
    @IsNumber()
    @Transform(({value}) => parseInt(value))
    @ApiPropertyOptional()
    year?: number;
}