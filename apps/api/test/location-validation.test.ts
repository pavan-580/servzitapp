import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestOtpDto } from '../src/modules/auth/dto/request-otp.dto';
import { VerifyOtpDto } from '../src/modules/auth/dto/verify-otp.dto';
import { CreateAddressDto } from '../src/modules/locations/dto/create-address.dto';
import { LocalitiesQuery } from '../src/modules/locations/dto/localities.query';

test('OTP request accepts E.164 numbers and rejects local-format input', async () => {
  assert.deepEqual(await validate(plainToInstance(RequestOtpDto, { phoneE164: '+919876543210' })), []);
  assert.ok((await validate(plainToInstance(RequestOtpDto, { phoneE164: '9876543210' }))).some((e) => e.property === 'phoneE164'));
});

test('OTP verification rejects malformed codes', async () => {
  const valid = plainToInstance(VerifyOtpDto, { phoneE164: '+919876543210', code: '123456' });
  assert.deepEqual(await validate(valid), []);
  const invalid = plainToInstance(VerifyOtpDto, { phoneE164: '+919876543210', code: 'not-a-code' });
  assert.ok((await validate(invalid)).some((e) => e.property === 'code'));
});

test('saved address input enforces real geographic bounds and bounded text fields', async () => {
  const valid = plainToInstance(CreateAddressDto, { addressLines: ['Flat 1'], lat: '17.44', lng: '78.38' });
  assert.deepEqual(await validate(valid), []);
  const invalid = plainToInstance(CreateAddressDto, { addressLines: [], lat: '100', lng: '200' });
  const properties = new Set((await validate(invalid)).map((e) => e.property));
  assert.ok(properties.has('addressLines'));
  assert.ok(properties.has('lat'));
  assert.ok(properties.has('lng'));
});

test('locality lookup requires a UUID city identifier', async () => {
  assert.deepEqual(await validate(plainToInstance(LocalitiesQuery, { cityId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74' })), []);
  assert.ok((await validate(plainToInstance(LocalitiesQuery, { cityId: 'invalid' }))).some((e) => e.property === 'cityId'));
});
