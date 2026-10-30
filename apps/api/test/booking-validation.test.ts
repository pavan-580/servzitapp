import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BookingDecisionDto } from '../src/modules/bookings/dto/booking-decision.dto';
import { BookingListQuery } from '../src/modules/bookings/dto/booking-list.query';
import { CreateBookingDto } from '../src/modules/bookings/dto/create-booking.dto';
import { CreateQuotationDto } from '../src/modules/bookings/dto/create-quotation.dto';

test('booking request requires an explicit timezone and validates bounded duration', async () => {
  const valid = plainToInstance(CreateBookingDto, {
    offeringId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', addressId: '2c28cc41-0d25-4961-8f47-811f7dff2b2c',
    scheduledFor: '2026-11-02T10:30:00+05:30', durationMinutes: '60', idempotencyKey: 'f27f5a3f-07c0-43d4-a191-e6d85d4e8ab2',
  });
  assert.deepEqual(await validate(valid), []);
  assert.equal(valid.durationMinutes, 60);

  const noOffset = plainToInstance(CreateBookingDto, {
    offeringId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', addressId: '2c28cc41-0d25-4961-8f47-811f7dff2b2c',
    scheduledFor: '2026-11-02T10:30:00', durationMinutes: '600',
  });
  const properties = new Set((await validate(noOffset)).map((e) => e.property));
  assert.ok(properties.has('scheduledFor'));
  assert.ok(properties.has('durationMinutes'));
});

test('provider decisions and booking pagination are allow-listed and bounded', async () => {
  assert.deepEqual(await validate(plainToInstance(BookingDecisionDto, { decision: 'accept' })), []);
  assert.ok((await validate(plainToInstance(BookingDecisionDto, { decision: 'complete' }))).some((e) => e.property === 'decision'));
  const query = plainToInstance(BookingListQuery, { page: '1', limit: '51' });
  assert.ok((await validate(query)).some((e) => e.property === 'limit'));
});

test('quoted service requests and quote-backed bookings require valid identifiers and schedule data', async () => {
  const quoteRequest = plainToInstance(CreateQuotationDto, {
    offeringId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', addressId: '2c28cc41-0d25-4961-8f47-811f7dff2b2c',
    idempotencyKey: 'f27f5a3f-07c0-43d4-a191-e6d85d4e8ab2',
  });
  assert.deepEqual(await validate(quoteRequest), []);
  const invalidQuoteRequest = plainToInstance(CreateQuotationDto, { offeringId: 'not-a-uuid', addressId: 'not-a-uuid' });
  assert.deepEqual(new Set((await validate(invalidQuoteRequest)).map((error) => error.property)), new Set(['offeringId', 'addressId']));

  const quoteBooking = plainToInstance(CreateBookingDto, {
    quotationId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', addressId: '2c28cc41-0d25-4961-8f47-811f7dff2b2c',
    scheduledFor: '2026-11-02T10:30:00+05:30', durationMinutes: '60', idempotencyKey: 'f27f5a3f-07c0-43d4-a191-e6d85d4e8ab2',
  });
  assert.deepEqual(await validate(quoteBooking), []);
});
