import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument } from "mongoose";


@Schema({timestamps: true})
export class TimeSlot extends BaseSchema{

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    maxRegistrations: number;

}

export const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);

export type TimeSlotDocument = HydratedDocument<TimeSlot>;