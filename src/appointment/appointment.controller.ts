import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetApptFilterDto } from './dtos/get-appt-filter.dto';

@Controller('api/appointment')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Get()
    @UseGuards(AuthGuard)
    async getAppointmentByUserId(@Req() req, @Query() filter: GetApptFilterDto) {
        console.log('filter', filter);
        return await this.appointmentService.getAppointmentByUserId(req.user.sub, filter);
    }
}