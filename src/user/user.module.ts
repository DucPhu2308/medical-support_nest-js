import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { DoctorInfo, DoctorInfoSchema } from 'src/schemas/doctor-info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DoctorInfo.name, schema: DoctorInfoSchema },
    ]),
    FirebaseModule,
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
