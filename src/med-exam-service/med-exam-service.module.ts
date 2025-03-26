import { Module } from '@nestjs/common';
import { MedExamServiceService } from './med-exam-service.service';
import { MedExamServiceController } from './med-exam-service.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedExamService, MedExamServiceSchema } from 'src/schemas/medExamService.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedExamService.name, schema: MedExamServiceSchema }
    ])
  ],
  providers: [MedExamServiceService],
  controllers: [MedExamServiceController]
})
export class MedExamServiceModule {}
