import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    gender: boolean;
    @ApiProperty()
    avatar: string;
    @ApiProperty()
    background: string;
    @ApiProperty()
    dob: Date;
    @ApiProperty()
    bio: string;
}