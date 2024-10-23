import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/schemas/appointment.schema';
import { AppointmentController } from './appointment.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    NotificationModule,
  ],
  providers: [AppointmentService],
  exports: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
