import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateProfileDto {
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    gender: boolean;

    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    avatar: Express.Multer.File;
    @ApiProperty()
    @IsOptional()
    background: string;
    @ApiProperty()
    dob: Date;
    @ApiProperty()
    bio: string;

    
}