import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateDrugDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsNotEmpty()
    brand: string;

    @ApiProperty()
    @IsNotEmpty()
    dosage: number;

    @ApiProperty()
    description: string;

}