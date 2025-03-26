import { ApiProperty } from "@nestjs/swagger";



export class GetShiftSegmentDto {
    @ApiProperty()
    doctor: string;

    @ApiProperty()
    date: string;

}