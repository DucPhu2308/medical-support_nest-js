import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateProfileDto {
    @ApiProperty()
    @IsOptional()
    firstName: string;

    @ApiProperty()
    @IsOptional()
    lastName: string;

    @ApiProperty()
    @IsOptional()
    gender: boolean;

    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    @IsOptional()
    avatar: Express.Multer.File;
    
    @ApiProperty()
    @IsOptional()
    background: string;

    @ApiProperty()
    @IsOptional()
    dob: Date;

    @ApiProperty()
    @IsOptional()
    bio: string;

    
}