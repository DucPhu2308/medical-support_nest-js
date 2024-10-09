import { ApiProperty } from "@nestjs/swagger";


export class PermissionDoctorDto {
    @ApiProperty()
    doctorId: string;

    @ApiProperty()
    isPermission: boolean;
}

