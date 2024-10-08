import { Module } from '@nestjs/common';
import { SpectialityController } from './department.controller';
import { SpectialityService } from './department.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Speciality, SpecialitySchema } from 'src/schemas/speciality.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Speciality.name, schema: SpecialitySchema }]),
  ],
  controllers: [SpectialityController],
  providers: [SpectialityService]
})
export class SpectialityModule {}
