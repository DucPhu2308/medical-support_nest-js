import { ApiProperty } from "@nestjs/swagger";



export class UpdateDoctorInfoDto {
    @ApiProperty()
    treatment: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    phone: string;
}