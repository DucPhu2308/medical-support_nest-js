import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument } from "mongoose";



@Schema({timestamps: true})
export class ShiftSegment extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ShiftAssignment' })
    shiftAssignment: mongoose.Types.ObjectId;

    @Prop({ required: true })
    startTime: string;

    @Prop({ required: true })
    endTime: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true ,default: 0})
    maxRegistrations: number;

    @Prop({ required: true, default: 0 })
    currentRegistrations: number;

    @Prop({ required: true, default: false })
    isFull: boolean;

}

export const ShiftSegmentSchema = SchemaFactory.createForClass(ShiftSegment);

export type ShiftSegmentDocument = HydratedDocument<ShiftSegment>;