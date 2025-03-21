import { Body, Controller, Delete, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ShiftAssignmentService } from './shift-assignment.service';
import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetShiftAssignmentDto } from './dtos/get-shift-assignment.dto';
import { ShiftAssignment } from 'src/schemas/shiftAssignment.schema';

@Controller('/api/shift-assignment')
@ApiTags('shift-assignment')
@ApiBearerAuth()
export class ShiftAssignmentController {
    constructor(
        private readonly shiftAssignmentService: ShiftAssignmentService
    ){}

    @Get('/all')
    @UseGuards(AuthGuard)
    async getShiftAssignments(@Request() req, @Query() getShiftAssignmentDto: GetShiftAssignmentDto) {
        return this.shiftAssignmentService.getShiftAssignments(getShiftAssignmentDto);
    }

   

    @Post('/create')
    @UseGuards(AuthGuard)
    async createShiftAssignment(@Request() req, @Body()createShiftAssignmentDto: CreateShiftAssignmentDto | CreateShiftAssignmentDto[]) {
        return this.shiftAssignmentService.createShiftAssignment(createShiftAssignmentDto);
    }


    @Delete('/delete')
    @UseGuards(AuthGuard)
    async deleteShiftAssignment(@Request() req, @Body()shiftAssignmentDto : any[]) {
        return this.shiftAssignmentService.deleteShiftAssignment(shiftAssignmentDto);
    }
}
