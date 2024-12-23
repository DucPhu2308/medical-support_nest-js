import { Module } from "@nestjs/common";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "src/schemas/comment.schema";
import { Post, PostSchema } from "src/schemas/post.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { NotificationModule } from "src/notification/notification.module";
import { FirebaseModule } from "src/firebase/firebase.module";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Post.name, schema:PostSchema },
            { name: User.name, schema:UserSchema }
        ]),
        NotificationModule,
        FirebaseModule
    ],
    controllers: [CommentController],
    providers: [CommentService],
})  
export class CommentModule {}