import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, Min, ValidateNested } from "class-validator";

export class CreateMedExamHistoryDto {
    doctor: string; // This will be set in the controller

    @ApiProperty()
    @IsNotEmpty()
    @IsMongoId()
    recordPatient: string;

    @ApiProperty()
    @IsNotEmpty()
    symptoms: string;

    @ApiProperty()
    @IsNotEmpty()
    result: string;

    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => DrugAssignDto)
    @IsOptional()
    drugAssign: DrugAssignDto[];
}

export class DrugAssignDto {
    @IsNotEmpty({ message: 'Drug is required' })
    @IsMongoId({ message: 'Drug must be a valid MongoDB ObjectId' })
    drug: string;
  
    @IsNotEmpty({ message: 'Quantity is required' })
    @IsInt({ message: 'Quantity must be an integer value' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
  }