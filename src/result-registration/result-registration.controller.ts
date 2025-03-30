import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ResultRegistrationService } from './result-registration.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateResultRegistrationDto } from './dtos/create-result-registration.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetResultRegistrationByFilterDto } from './dtos/get-result-registration-by-filter.dto';

@Controller('api/result-registration')
@ApiTags('Result Registration')
export class ResultRegistrationController {
    constructor(
        private readonly resultRegistrationService: ResultRegistrationService
    ) {}

    @Get('/allByUser/:userId')
    @UseGuards(AuthGuard)
    async getAllResultRegistration(@Param('userId') userId: string) {
        return this.resultRegistrationService.getAllResultRegistration(userId);
    }

    @Get('/detail/:id')
    @UseGuards(AuthGuard)
    async getResultRegistrationById(@Param('id') id: string) {
        return this.resultRegistrationService.getResultRegistrationById(id);
    }

    @Post('/create')
    @UseGuards(AuthGuard)
    async createResultRegistration(@Body() createResultRegistrationDto: CreateResultRegistrationDto) {
        return this.resultRegistrationService.createResultRegistration(createResultRegistrationDto);
    }


    @Delete('/delete/:id')
    @UseGuards(AuthGuard)
    async deleteResultRegistration(@Param('id') id: string) {
        return this.resultRegistrationService.deleteResultRegistration(id);
    }

    @Get('/doctor/get-by-filter')
    @UseGuards(AuthGuard)
    async getResultRegistrationByFilter(@Request() req, @Query() filter: GetResultRegistrationByFilterDto) {
        filter.doctor = req.user.sub;
        return this.resultRegistrationService.getResultRegistrationByFilter(filter);
    }
}
