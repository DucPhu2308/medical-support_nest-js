import { Module } from '@nestjs/common';
import { MedExamHistoryService } from './med-exam-history.service';
import { MedExamHistoryController } from './med-exam-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedExamHistory, MedExamHistorySchema } from 'src/schemas/med-exam-history.schema';
import { RecordPatient, RecordPatientSchema } from 'src/schemas/recordPatient.sechma';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MedExamHistory.name, schema: MedExamHistorySchema }]),
    MongooseModule.forFeature([{ name: RecordPatient.name, schema: RecordPatientSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [MedExamHistoryService],
  controllers: [MedExamHistoryController]
})
export class MedExamHistoryModule {}
