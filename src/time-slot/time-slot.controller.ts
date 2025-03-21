import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';
import { CreateTimeSlotDto } from './dtos/create-time-slot.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/time-slot')
@ApiTags('time-slot')
@UseGuards()
export class TimeSlotController {
    constructor(
        private readonly timeSlotService: TimeSlotService
    ) { }


    @Get("/all")
    async getAllTimeSlots() {
        return this.timeSlotService.getTimeSlots();
    }

    @Get('/date/:date')
    async getTimeSlotsByDate(@Param('date') date: string) {
        return this.timeSlotService.getTimeSlotsByDate(date);
    }


    @Post("/create")
    @UseGuards(AuthGuard)
    async createTimeSlot(@Body() createTimeSlotDto:CreateTimeSlotDto | CreateTimeSlotDto[]) {
        return this.timeSlotService.createTimeSlot(createTimeSlotDto);
    }

    @Put("/update/:id")
    @UseGuards(AuthGuard)
    async updateTimeSlot(@Param('id') id: string, @Body() createTimeSlotDto: CreateTimeSlotDto) {
        return this.timeSlotService.updateTimeSlot(id, createTimeSlotDto);
    }

    @Delete("/delete/:id")
    @UseGuards(AuthGuard)
    async deleteTimeSlot(@Param('id') id: string) {
        return this.timeSlotService.deleteTimeSlot(id);
    }
}
