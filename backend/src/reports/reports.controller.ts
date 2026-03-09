import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'STAFF')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('dashboard')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
