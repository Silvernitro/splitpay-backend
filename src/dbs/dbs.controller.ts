import { Controller } from '@nestjs/common';
import { DbsService } from './dbs.service';

@Controller('dbs')
export class DbsController {
  constructor(private readonly dbsService: DbsService) {}
}
