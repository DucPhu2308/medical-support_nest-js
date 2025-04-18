import { Module } from '@nestjs/common';
import { ResultRegistrationService } from './result-registration.service';
import { ResultRegistrationController } from './result-registration.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultRegistration, ResultRegistrationSchema } from 'src/schemas/resultRegistration.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ShiftSegmentModule } from 'src/shift-segment/shift-segment.module';
import { MedExamHistory, MedExamHistorySchema } from 'src/schemas/med-exam-history.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResultRegistration.name, schema: ResultRegistrationSchema },
      { name: User.name, schema: UserSchema },
      { name: MedExamHistory.name, schema: MedExamHistorySchema },
    ]),
    ShiftSegmentModule,
    NotificationModule,
  ],
  providers: [ResultRegistrationService],
  controllers: [ResultRegistrationController]
})
export class ResultRegistrationModule {}
