import { Prop } from "@nestjs/mongoose";

export class BaseSchema {
    @Prop({ default: new Date() })
    createdAt: Date;
    @Prop()
    updatedAt: Date;
}