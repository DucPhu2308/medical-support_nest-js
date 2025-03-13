import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { BaseSchema } from "./base.schema";


@Schema({timestamps: true})
export class ShiftAssignment extends BaseSchema {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Shift' })
    shift : mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user : mongoose.Types.ObjectId;

    @Prop()
    date : string;

}

export const ShiftAssignmentSchema = SchemaFactory.createForClass(ShiftAssignment);

export type ShiftAssignmentDocument = HydratedDocument<ShiftAssignment>;