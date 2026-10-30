import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveServiceOfferingDto } from '../src/modules/providers/dto/save-service-offering.dto';

test('provider service listing validates pricing modes, currency and minor-unit amounts', async () => {
  const fixed = plainToInstance(SaveServiceOfferingDto, {
    serviceId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', pricingModel: 'fixed', priceMinor: '49900', currency: 'INR',
  });
  assert.deepEqual(await validate(fixed), []);

  const quote = plainToInstance(SaveServiceOfferingDto, {
    serviceId: '7b2374ae-fbdb-42d7-96c2-35fa1ef2fc74', pricingModel: 'quote', currency: 'INR',
  });
  assert.deepEqual(await validate(quote), []);

  const invalid = plainToInstance(SaveServiceOfferingDto, {
    serviceId: 'not-a-uuid', pricingModel: 'free', priceMinor: '49.99', currency: 'rupees',
  });
  assert.deepEqual(new Set((await validate(invalid)).map((error) => error.property)), new Set(['serviceId', 'pricingModel', 'priceMinor', 'currency']));
});
