import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class CreateRecordPatientDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    dob: string;

    @ApiProperty()
    @IsNotEmpty()
    job: string;

    @ApiProperty()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsNotEmpty()
    province: string;

    @ApiProperty()
    @IsNotEmpty()
    district: string;

    @ApiProperty()
    @IsNotEmpty()
    ward: string;

    @ApiProperty()
    @IsNotEmpty()
    gender: boolean;

    @ApiProperty()
    @IsNotEmpty()
    createdBy: string;


    @ApiProperty()
    @IsNotEmpty()
    provinceCode: string;

    @ApiProperty()
    @IsNotEmpty()
    districtCode: string;

    @ApiProperty()
    @IsNotEmpty()
    wardCode: string;

}