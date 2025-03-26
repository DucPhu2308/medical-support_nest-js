import { Module } from '@nestjs/common';
import { ShiftSegmentService } from './shift-segment.service';
import { ShiftSegmentController } from './shift-segment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ShiftSegment, ShiftSegmentSchema } from 'src/schemas/shiftSegment.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from 'src/schemas/shiftAssignment.schema';
import { Shift, ShiftSchema } from 'src/schemas/shift.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShiftSegment.name, schema: ShiftSegmentSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: Shift.name, schema: ShiftSchema },
    ]),
  ],
  providers: [ShiftSegmentService],
  controllers: [ShiftSegmentController],
  exports: [ShiftSegmentService]
  
})
export class ShiftSegmentModule {}
