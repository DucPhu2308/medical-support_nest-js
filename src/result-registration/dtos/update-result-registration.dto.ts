import { ApiProperty } from "@nestjs/swagger";
import { ResultRegistrationStatus } from "src/schemas/resultRegistration.schema";

export class UpdateResultRegistrationDto {
    @ApiProperty()
    status: ResultRegistrationStatus;
}