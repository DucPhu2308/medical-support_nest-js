import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NotificationModule } from 'src/notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { Speciality, SpecialitySchema } from 'src/schemas/speciality.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema },{ name: Speciality.name, schema: SpecialitySchema }]),
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
