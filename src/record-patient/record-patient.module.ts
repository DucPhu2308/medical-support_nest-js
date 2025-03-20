import { Module } from '@nestjs/common';
import { RecordPatientService } from './record-patient.service';
import { RecordPatientController } from './record-patient.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordPatient, RecordPatientSchema } from 'src/schemas/recordPatient.sechma';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RecordPatient.name, schema: RecordPatientSchema }])
  ],
  providers: [RecordPatientService],
  controllers: [RecordPatientController]
})
export class RecordPatientModule {}
