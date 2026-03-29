import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  @Get()
  findAll(@Request() req) {
    if (req.user.role === 'admin') return this.tenants.findAll();
    return this.tenants.findOne(req.user.tenant_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenants.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.role === 'admin' ? id : req.user.tenant_id;
    return this.tenants.getStats(tenantId);
  }
}
