import { Module } from '@nestjs/common';
import { TimeSlotController } from './time-slot.controller';
import { TimeSlotService } from './time-slot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeSlot, TimeSlotSchema } from 'src/schemas/timeSlot.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeSlot.name, schema: TimeSlotSchema }]),
  ],
  controllers: [TimeSlotController],
  providers: [TimeSlotService]
})
export class TimeSlotModule {}
