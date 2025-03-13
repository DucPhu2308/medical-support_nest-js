import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shift, ShiftSchema } from 'src/schemas/shift.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shift.name, schema: ShiftSchema },
    ]),
  ],
  controllers: [ShiftController],
  providers: [ShiftService]
})
export class ShiftModule {}
