import { ApiProperty } from "@nestjs/swagger";

export class FollowUserDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    followId: string;
}