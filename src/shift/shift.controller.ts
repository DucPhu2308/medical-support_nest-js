import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dtos/create-shift.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/shift')
@ApiTags('shift')
@ApiBearerAuth()
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @Get('/all')
    @UseGuards(AuthGuard)
    async getShifts() {
        return this.shiftService.findAll();
    }
    
    @Post('/create')
    @UseGuards(AuthGuard)
    async createShift(@Request() req, @Body() createShiftDto: CreateShiftDto) {
        return this.shiftService.createShift(createShiftDto);
    }

    @Put('/update/:shiftId')
    @UseGuards(AuthGuard)
    async updateShift(@Request() req, @Body() createShiftDto: CreateShiftDto, @Param('shiftId') shiftId: string) {
        return this.shiftService.updateShift(shiftId, createShiftDto);
    }

    @Delete('/delete/:shiftId')
    @UseGuards(AuthGuard)
    async deleteShift(@Request() req, @Param('shiftId') shiftId: string) {
        return this.shiftService.deleteShift(shiftId);
    }

}
