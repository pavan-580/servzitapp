import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NearbyProvidersQuery } from '../src/modules/catalog/dto/nearby-providers.query';
import { SearchCategoriesQuery } from '../src/modules/catalog/dto/search-categories.query';

test('nearby query accepts coordinate strings and applies bounded defaults', async () => {
  const query = plainToInstance(NearbyProvidersQuery, { lat: '17.44', lng: '78.38' });
  const errors = await validate(query);
  assert.deepEqual(errors, []);
  assert.equal(query.lat, 17.44);
  assert.equal(query.lng, 78.38);
  assert.equal(query.radiusMeters, 10000);
  assert.equal(query.page, 1);
  assert.equal(query.limit, 20);
});

test('nearby query rejects invalid coordinates and unbounded radius/pagination', async () => {
  const query = plainToInstance(NearbyProvidersQuery, {
    lat: '91', lng: '181', radiusMeters: '100001', page: '100001', limit: '51',
  });
  const errors = await validate(query);
  const properties = new Set(errors.map((error) => error.property));
  assert.deepEqual(properties, new Set(['lat', 'lng', 'radiusMeters', 'page', 'limit']));
});

test('nearby query rejects non-UUID category identifiers and oversized search text', async () => {
  const query = plainToInstance(NearbyProvidersQuery, {
    lat: 17.44, lng: 78.38, categoryId: 'not-a-uuid', q: 'x'.repeat(101),
  });
  const errors = await validate(query);
  const properties = new Set(errors.map((error) => error.property));
  assert.ok(properties.has('categoryId'));
  assert.ok(properties.has('q'));
});

test('category search rejects oversized input', async () => {
  const query = plainToInstance(SearchCategoriesQuery, { q: 'x'.repeat(101) });
  const errors = await validate(query);
  assert.deepEqual(errors.map((error) => error.property), ['q']);
});
