import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, AuthenticatedRequest } from '../auth/access-token.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { LocalitiesQuery } from './dto/localities.query';
import { AddressRow, CityItem, LocalityItem, LocationsService } from './locations.service';

@ApiTags('locations')
@Controller()
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get('locations/cities')
  @ApiOperation({ summary: 'List configured cities' })
  cities(): Promise<{ items: CityItem[] }> { return this.locations.cities(); }

  @Get('locations/localities')
  @ApiOperation({ summary: 'List configured localities in a city' })
  localities(@Query() query: LocalitiesQuery): Promise<{ items: LocalityItem[] }> { return this.locations.localities(query.cityId); }

  @Get('me/addresses')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the signed-in customer’s saved addresses' })
  addresses(@Req() request: AuthenticatedRequest): Promise<{ items: AddressRow[] }> { return this.locations.addresses(request.user.id); }

  @Post('me/addresses')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a location and delivery/service address' })
  createAddress(@Req() request: AuthenticatedRequest, @Body() dto: CreateAddressDto): Promise<AddressRow | null> {
    return this.locations.createAddress(request.user.id, dto);
  }

  @Delete('me/addresses/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete one of the signed-in customer’s saved addresses' })
  deleteAddress(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string): Promise<{ deleted: boolean }> {
    return this.locations.deleteAddress(request.user.id, id);
  }
}
