import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, AuthenticatedRequest } from '../auth/access-token.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminService, ReviewQueueRow } from './admin.service';
import { ReviewProviderDto } from './dto/review-provider.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('providers/review-queue')
  @ApiOperation({ summary: 'List provider profiles that require administrator review' })
  providerReviewQueue(): Promise<{ items: ReviewQueueRow[] }> { return this.admin.providerReviewQueue(); }

  @Patch('providers/:id/review')
  @ApiOperation({ summary: 'Review and publish or reject a provider profile; approval requires reviewed identity and business documents' })
  reviewProvider(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewProviderDto) {
    return this.admin.reviewProvider(request.user.id, id, dto);
  }
}
