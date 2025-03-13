import { Module } from '@nestjs/common';
import { ShiftAssignmentService } from './shift-assignment.service';
import { ShiftAssignmentController } from './shift-assignment.controller';
import { ShiftAssignment, ShiftAssignmentSchema } from 'src/schemas/shiftAssignment.schema';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
    ]),
  ],
  providers: [ShiftAssignmentService],
  controllers: [ShiftAssignmentController]
})
export class ShiftAssignmentModule { }
