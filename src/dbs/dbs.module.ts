import { Module } from '@nestjs/common';
import { DbsService } from './dbs.service';
import { DbsController } from './dbs.controller';

@Module({
  controllers: [DbsController],
  providers: [DbsService],
})
export class DbsModule {}
