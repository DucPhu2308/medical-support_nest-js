import { IsEnum, IsNotEmpty } from "class-validator";
import { MessageType } from "src/schemas/message.schema";


export class MessageDto {
    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    recipient: string;
    
    sender: string;

    @IsEnum(MessageType)
    type: MessageType;

}