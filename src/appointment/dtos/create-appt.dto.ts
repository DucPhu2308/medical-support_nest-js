import { Types } from "mongoose";

export class CreateAppointmentDto {
    readonly title: string;
    readonly content: string;
    readonly date: Date;
    readonly sender: string | Types.ObjectId;
    readonly recipient: string | Types.ObjectId;
    readonly message: string | Types.ObjectId;
}