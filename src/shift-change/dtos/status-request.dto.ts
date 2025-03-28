import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";



export class StatusRequestDto {

    @ApiProperty()
    @IsNotEmpty()
    status: string;

    @ApiProperty()
    reason: string;

}

