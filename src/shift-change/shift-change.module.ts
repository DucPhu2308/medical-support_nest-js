import { Module } from '@nestjs/common';
import { ShiftChangeController } from './shift-change.controller';
import { ShiftChangeService } from './shift-change.service';
import { ShiftChange, ShiftChangeSchema } from 'src/schemas/shiftChange.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShiftChange.name, schema: ShiftChangeSchema }])
  ],
  controllers: [ShiftChangeController],
  providers: [ShiftChangeService]
})
export class ShiftChangeModule {}
