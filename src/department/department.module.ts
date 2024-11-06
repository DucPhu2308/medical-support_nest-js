import { Module } from '@nestjs/common';
import { SpectialityController } from './department.controller';
import { SpectialityService } from './department.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Speciality, SpecialitySchema } from 'src/schemas/speciality.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { DoctorInfo, DoctorInfoSchema } from 'src/schemas/doctor-info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Speciality.name, schema: SpecialitySchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: DoctorInfo.name, schema: DoctorInfoSchema }])
  ],
  controllers: [SpectialityController],
  providers: [SpectialityService]
})
export class SpectialityModule {}
