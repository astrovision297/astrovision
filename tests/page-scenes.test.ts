import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pageScene, sceneRoutes } from '../src/lib/page-themes';
import { createPageArt, animatePageArt, disposePageArt } from '../src/lib/page-art';
import { services } from '../src/data/content';
import * as THREE from 'three';

test('every supported inner page has a unique scene and an existing fallback', () => {
  const configs = sceneRoutes.map(pageScene);
  assert.equal(configs.length, 38);
  assert.equal(new Set(configs.map(config => config.id)).size, configs.length);
  assert.equal(new Set(configs.map(config => config.poster)).size, configs.length);
  for (const config of configs) assert.ok(existsSync(`public${config.poster}`), config.poster);
  assert.equal(pageScene('/').poster, '/images/jyotisha-poster.svg');
});

test('service geometry differs by subject and by service within each subject', () => {
  const signatures = new Set<string>();
  for (const service of services) {
    const config = pageScene(`/services/${service.slug}`);
    const model = createPageArt(config.theme, config);
    const geometry: string[] = [];
    // Exclude seeded dust and transforms: differences must be in the artwork itself.
    model.children[0].traverse(object => {
      if (object instanceof THREE.Mesh) geometry.push(JSON.stringify((object.geometry as THREE.BufferGeometry & { parameters?: unknown }).parameters));
    });
    const signature = geometry.sort().join('|');
    assert.ok(!signatures.has(signature), `Repeated sculpture for ${service.slug}`);
    signatures.add(signature);
    disposePageArt(model);
  }
});

test('all scenes animate safely and release their geometry on disposal', () => {
  for (const route of sceneRoutes) {
    const config = pageScene(route);
    const model = createPageArt(config.theme, config);
    let disposed = 0;
    model.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
        object.geometry.addEventListener('dispose', () => disposed++);
      }
    });
    for (const elapsed of [0, 1, 30, 3600]) {
      animatePageArt(model, elapsed);
      model.traverse(object => {
        assert.ok([...object.position, ...object.scale, object.rotation.x, object.rotation.y, object.rotation.z].every(Number.isFinite), route);
      });
    }
    disposePageArt(model);
    assert.ok(disposed > 0, route);
  }
});
