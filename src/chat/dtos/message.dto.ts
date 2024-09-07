import { IsEnum, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";
import { MessageType } from "src/schemas/message.schema";


export class MessageDto {
    @IsNotEmpty()
    content: any;

    @IsNotEmpty()
    chat: Types.ObjectId;
    
    sender: Types.ObjectId;

    @IsEnum(MessageType)
    type: MessageType;

}