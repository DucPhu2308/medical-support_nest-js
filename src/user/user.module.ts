import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    FirebaseModule,
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
