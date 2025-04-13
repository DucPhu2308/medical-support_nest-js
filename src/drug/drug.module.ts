import { Module } from '@nestjs/common';
import { DrugController } from './drug.controller';
import { DrugService } from './drug.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Drug, DrugSchema } from 'src/schemas/drug.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Drug.name, schema: DrugSchema}
    ]),
  ],
  controllers: [DrugController],
  providers: [DrugService]
})
export class DrugModule {}
