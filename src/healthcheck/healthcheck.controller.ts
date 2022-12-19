import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthcheckController {
  @Get()
  async healthcheck() {
    return 'Server up and running.';
  }
}
