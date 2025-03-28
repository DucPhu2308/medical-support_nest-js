import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export enum Status {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}


@Schema({timestamps: true})
export class ShiftChange extends BaseSchema{

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    currentDoctor : mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    newDoctor : mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ShiftAssignment' })
    shiftAssignment : mongoose.Types.ObjectId;

    @Prop()
    date : string;

    @Prop()
    reason : string;

    @Prop({type: String, enum: Status, default: Status.PENDING})
    status: string;

    @Prop({ type: String, default: null })
    reasonRejected: string;

}


export const ShiftChangeSchema = SchemaFactory.createForClass(ShiftChange);

export type ShiftChangeDocument = HydratedDocument<ShiftChange>;