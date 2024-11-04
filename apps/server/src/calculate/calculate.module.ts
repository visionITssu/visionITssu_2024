import { Module } from '@nestjs/common';
import { CalculateService } from './calculate.service';
import { CalculateController } from './calculate.controller';

@Module({
  providers: [CalculateService],
  controllers: [CalculateController],
})
export class CalculateModule {}
