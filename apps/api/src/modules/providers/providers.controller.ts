import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, AuthenticatedRequest } from '../auth/access-token.guard';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { SaveServiceOfferingDto } from './dto/save-service-offering.dto';
import { ProviderAvailabilitySlot, ProviderOfferingRow, ProviderProfileRow, ProvidersService } from './providers.service';

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in user’s provider onboarding status' })
  me(@Req() request: AuthenticatedRequest): Promise<{ provider: ProviderProfileRow | null }> {
    return this.providers.getMine(request.user.id);
  }

  @Post('onboarding')
  @ApiOperation({ summary: 'Create a provider profile that remains pending administrator approval' })
  onboard(@Req() request: AuthenticatedRequest, @Body() dto: CreateProviderProfileDto) {
    return this.providers.createOrGet(request.user.id, dto);
  }

  @Get('me/availability')
  @ApiOperation({ summary: 'Get working-hour windows set by the signed-in provider' })
  availability(@Req() request: AuthenticatedRequest): Promise<{ slots: ProviderAvailabilitySlot[] }> { return this.providers.getAvailability(request.user.id); }

  @Post('me/availability')
  @ApiOperation({ summary: 'Replace the signed-in provider’s weekly working hours' })
  updateAvailability(@Req() request: AuthenticatedRequest, @Body() dto: UpdateAvailabilityDto): Promise<{ slots: UpdateAvailabilityDto['slots'] }> {
    return this.providers.updateAvailability(request.user.id, dto);
  }

  @Get('me/services')
  @ApiOperation({ summary: 'List service offerings owned by the signed-in provider' })
  services(@Req() request: AuthenticatedRequest): Promise<{ items: ProviderOfferingRow[] }> { return this.providers.getServices(request.user.id); }

  @Post('me/services')
  @ApiOperation({ summary: 'Create or update a service listing for the signed-in provider' })
  saveService(@Req() request: AuthenticatedRequest, @Body() dto: SaveServiceOfferingDto) { return this.providers.saveService(request.user.id, dto); }

  @Delete('me/services/:id')
  @ApiOperation({ summary: 'Unlist a service offering owned by the signed-in provider' })
  deleteService(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) { return this.providers.deactivateService(request.user.id, id); }
}
