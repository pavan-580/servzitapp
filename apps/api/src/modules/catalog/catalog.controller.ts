import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { NearbyProvidersQuery } from './dto/nearby-providers.query';
import { SearchCategoriesQuery } from './dto/search-categories.query';
import { SearchServicesQuery } from './dto/search-services.query';

@ApiTags('marketplace')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('service-categories')
  @ApiOperation({ summary: 'List active service categories' })
  getServiceCategories(@Query() query: SearchCategoriesQuery) {
    return this.catalog.getServiceCategories(query.q);
  }

  @Get('services')
  @ApiOperation({ summary: 'List active services available for provider catalogues' })
  getServices(@Query() query: SearchServicesQuery) { return this.catalog.getServices(query); }

  @Get('providers/nearby')
  @ApiOperation({ summary: 'Find approved providers serving a real coordinate' })
  @ApiQuery({ name: 'lat', required: true, type: Number, example: 17.44 })
  @ApiQuery({ name: 'lng', required: true, type: Number, example: 78.38 })
  @ApiQuery({ name: 'radiusMeters', required: false, type: Number, example: 10000 })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getNearbyProviders(@Query() query: NearbyProvidersQuery) {
    return this.catalog.getNearbyProviders(query);
  }
}
