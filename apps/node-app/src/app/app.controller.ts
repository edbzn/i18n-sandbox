import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('en')
  getDataEn() {
    return this.appService.getData('en');
  }

  @Get('fr')
  getDataFr() {
    return this.appService.getData('fr');
  }

  @Get()
  getData() {
    return this.appService.getData('en');
  }
}
