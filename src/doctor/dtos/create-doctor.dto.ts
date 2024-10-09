import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";



export class CreateDoctorDto {
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    dob: Date;

    @ApiProperty()
    @IsNotEmpty()
    gender: boolean;

    @ApiProperty()
    @IsNotEmpty()
    specialty: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    avatar: Express.Multer.File;


}
