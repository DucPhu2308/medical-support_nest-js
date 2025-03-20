import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { PostModule } from './post/post.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CommentModule } from './comment/comment.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorModule } from './doctor/doctor.module';
import { SpectialityModule } from './department/department.module';
import { NotificationModule } from './notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { ShiftModule } from './shift/shift.module';
import { ShiftAssignmentModule } from './shift-assignment/shift-assignment.module';
import { RecordPatientModule } from './record-patient/record-patient.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ 
      envFilePath: process.env.NODE_ENV === 'deploy' ? '.env.deploy' : '.env', 
      isGlobal: true, cache: true 
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    PostModule,
    FirebaseModule,
    ChatModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    CommentModule,
    AppointmentModule,
    DoctorModule,
    SpectialityModule,
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST,
    //     port: parseInt(process.env.REDIS_PORT),
    //     password: process.env.REDIS_PASSWORD,
    //   },
    // }),
    NotificationModule,
    ShiftModule,
    ShiftAssignmentModule,
    RecordPatientModule,
    PaymentModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
