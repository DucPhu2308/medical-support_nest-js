import { Prop } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

export class BaseSchema {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new Types.ObjectId() })
    _id?: Types.ObjectId;
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
}