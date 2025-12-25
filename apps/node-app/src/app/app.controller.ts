import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('en')
  getDataEn(@Query('itemCount') itemCount?: string, @Query('minutes') minutes?: string) {
    return this.appService.getData(itemCount ? parseInt(itemCount, 10) : 3, minutes ? parseInt(minutes, 10) : 5);
  }

  @Get('fr')
  getDataFr(@Query('itemCount') itemCount?: string, @Query('minutes') minutes?: string) {
    return this.appService.getData(itemCount ? parseInt(itemCount, 10) : 3, minutes ? parseInt(minutes, 10) : 5);
  }

  @Get()
  getData(@Query('itemCount') itemCount?: string, @Query('minutes') minutes?: string) {
    return this.appService.getData(itemCount ? parseInt(itemCount, 10) : 3, minutes ? parseInt(minutes, 10) : 5);
  }
}
