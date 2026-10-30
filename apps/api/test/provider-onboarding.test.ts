import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProviderProfileDto } from '../src/modules/providers/dto/create-provider-profile.dto';

test('provider profile accepts supported account types and a bounded real service radius', async () => {
  const valid = plainToInstance(CreateProviderProfileDto, {
    accountType: 'individual', businessName: 'Local Electrician', addressLine: 'Miyapur', lat: '17.44', lng: '78.38', serviceRadiusMeters: '10000',
  });
  assert.deepEqual(await validate(valid), []);
  assert.equal(valid.serviceRadiusMeters, 10000);
});

test('provider profile rejects unknown roles, invalid coordinates, and unbounded service coverage', async () => {
  const invalid = plainToInstance(CreateProviderProfileDto, {
    accountType: 'super_admin', businessName: 'X', addressLine: 'Somewhere', lat: '91', lng: '181', serviceRadiusMeters: '100001',
  });
  const properties = new Set((await validate(invalid)).map((e) => e.property));
  assert.ok(properties.has('accountType'));
  assert.ok(properties.has('lat'));
  assert.ok(properties.has('lng'));
  assert.ok(properties.has('serviceRadiusMeters'));
});
