import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { DoctorInfo, DoctorInfoSchema } from 'src/schemas/doctor-info.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { Speciality, SpecialitySchema } from 'src/schemas/speciality.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from 'src/schemas/shiftAssignment.schema';
import { ShiftSegment, ShiftSegmentSchema } from 'src/schemas/shiftSegment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: DoctorInfo.name, schema: DoctorInfoSchema }, { name: Speciality.name, schema: SpecialitySchema }, { name: ShiftAssignment.name, schema: ShiftAssignmentSchema }, { name: ShiftSegment.name, schema: ShiftSegmentSchema }]),
    FirebaseModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],


})
export class DoctorModule { }
