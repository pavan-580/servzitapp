import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, AuthenticatedRequest } from '../auth/access-token.guard';
import { BookingDecisionDto } from './dto/booking-decision.dto';
import { BookingListQuery } from './dto/booking-list.query';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationResponseDto } from './dto/quotation-response.dto';
import { SendQuotationDto } from './dto/send-quotation.dto';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller()
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post('bookings')
  @ApiOperation({ summary: 'Request a scheduled booking for a fixed or inspection-priced service' })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.bookings.create(request.user.id, dto);
  }

  @Post('quotations')
  @ApiOperation({ summary: 'Request a quotation for a quote-priced provider service' })
  requestQuotation(@Req() request: AuthenticatedRequest, @Body() dto: CreateQuotationDto) {
    return this.bookings.requestQuotation(request.user.id, dto);
  }

  @Get('quotations')
  @ApiOperation({ summary: 'List quotation requests belonging to the signed-in customer' })
  customerQuotations(@Req() request: AuthenticatedRequest, @Query() query: BookingListQuery) {
    return this.bookings.customerQuotations(request.user.id, query);
  }

  @Post('quotations/:id/respond')
  @ApiOperation({ summary: 'Reject a provider quotation' })
  respondToQuotation(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: QuotationResponseDto) {
    return this.bookings.respondToQuotation(request.user.id, id, dto);
  }

  @Post('quotations/:id/cancel')
  @ApiOperation({ summary: 'Cancel an open quotation request' })
  cancelQuotation(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.cancelQuotation(request.user.id, id);
  }

  @Get('providers/me/quotations')
  @ApiOperation({ summary: 'List quotation requests for the signed-in provider' })
  providerQuotations(@Req() request: AuthenticatedRequest, @Query() query: BookingListQuery) {
    return this.bookings.providerQuotations(request.user.id, query);
  }

  @Patch('providers/me/quotations/:id')
  @ApiOperation({ summary: 'Send a price and terms for a customer quotation request' })
  sendQuotation(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SendQuotationDto) {
    return this.bookings.sendQuotation(request.user.id, id, dto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List the signed-in customer’s bookings' })
  customerBookings(@Req() request: AuthenticatedRequest, @Query() query: BookingListQuery) {
    return this.bookings.customerBookings(request.user.id, query);
  }

  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancel a future booking owned by the signed-in customer' })
  cancel(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.cancel(request.user.id, id);
  }

  @Get('providers/me/bookings')
  @ApiOperation({ summary: 'List booking requests for the signed-in provider’s profile' })
  providerBookings(@Req() request: AuthenticatedRequest, @Query() query: BookingListQuery) {
    return this.bookings.providerBookings(request.user.id, query);
  }

  @Patch('providers/me/bookings/:id/decision')
  @ApiOperation({ summary: 'Accept or reject a booking request owned by the signed-in provider' })
  decide(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() dto: BookingDecisionDto) {
    return this.bookings.decide(request.user.id, id, dto);
  }
}
