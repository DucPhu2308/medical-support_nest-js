import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { DoctorInfo, DoctorInfoSchema } from 'src/schemas/doctor-info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: DoctorInfo.name, schema: DoctorInfoSchema }]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
