import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ResultRegistrationService } from './result-registration.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateResultRegistrationDto } from './dtos/create-result-registration.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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
}
