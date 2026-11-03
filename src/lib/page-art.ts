import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { type ArtTheme, type SceneMotif } from './page-themes';
export { artThemes, type ArtTheme } from './page-themes';

function shadeMoonGeometry(geometry: THREE.BufferGeometry, phase: number) {
  const normals = geometry.attributes.normal;
  const colors = geometry.attributes.color;
  const grain = geometry.attributes.lunarGrain;
  const sx = Math.sin(phase), sz = -Math.cos(phase);
  for (let i = 0; i < normals.count; i++) {
    const light = Math.max(0, normals.getX(i) * sx + normals.getZ(i) * sz);
    const value = (.055 + .945 * Math.pow(light, .55)) * grain.getX(i);
    colors.setXYZ(i, value * .92, value * .92, value * .88);
  }
  colors.needsUpdate = true;
}

// Original, symbolic astrology diagrams. These are not a calculated personal chart.
// Meanings and research references: ASTROLOGY_VISUAL_RESEARCH.md.
export function createPageArt(theme: ArtTheme, options?: { motif: SceneMotif; edition: number; seed: number }) {
  const motif = options?.motif ?? theme;
  const edition = options?.edition ?? 0;
  const seed = (options?.seed ?? 0) / 4294967296;
  const root = new THREE.Group();
  root.name = `Astrology-${theme}`;
  const brass = new THREE.MeshStandardMaterial({ color: '#eac987', metalness: .55, roughness: .36 });
  const pale = new THREE.MeshBasicMaterial({ color: '#eeddb8' });
  const ink = new THREE.MeshStandardMaterial({ color: '#101f38', metalness: .25, roughness: .65 });
  const blue = new THREE.MeshBasicMaterial({ color: '#87b5cb' });
  const rose = new THREE.MeshBasicMaterial({ color: '#d9a6a0' });

  function mesh(parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material = brass, position = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position as [number, number, number]); parent.add(object); return object;
  }
  function stroke(parent: THREE.Group, coords: number[][], material: THREE.Material = brass, width = .012, closed = false, smooth = false) {
    const points = coords.map(([x, y, z = .06]) => new THREE.Vector3(x, y, z));
    if (closed) points.push(points[0].clone());
    if (smooth) {
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', .3);
      return mesh(parent, new THREE.TubeGeometry(curve, Math.max(48, points.length * 12), width, 8, false), material);
    }
    // Build each straight edge explicitly. Sampling a whole CurvePath cuts
    // across corners and leaves the engraved chart borders visibly uneven.
    const pieces: THREE.BufferGeometry[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 1; i < points.length; i++) {
      const direction = points[i].clone().sub(points[i - 1]);
      if (direction.lengthSq() === 0) continue;
      const geometry = new THREE.CylinderGeometry(width, width, direction.length(), 8, 1);
      const rotation = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize());
      geometry.applyMatrix4(new THREE.Matrix4().compose(points[i].clone().add(points[i - 1]).multiplyScalar(.5), rotation, new THREE.Vector3(1, 1, 1)));
      pieces.push(geometry);
    }
    if (points.length > 2) {
      for (const point of points.slice(0, closed ? -1 : undefined)) {
        pieces.push(new THREE.SphereGeometry(width, 8, 6).translate(point.x, point.y, point.z));
      }
    }
    const geometry = mergeGeometries(pieces);
    pieces.forEach(piece => piece.dispose());
    return mesh(parent, geometry, material);
  }

  function segment(parent: THREE.Group, a: number[], b: number[], material: THREE.Material = brass, width = .012) {
    return stroke(parent, [a, b], material, width);
  }
  function ring(parent: THREE.Group, radius: number, width = .018, z = 0, material: THREE.Material = brass) {
    return mesh(parent, new THREE.TorusGeometry(radius, width, 6, 128), material, [0, 0, z]);
  }
  function label(parent: THREE.Group, text: string, x: number, y: number, size = .15, color = '#ead6a7', z = .10) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 96;
    const context = canvas.getContext('2d'); if (!context) return;
    context.fillStyle = color; context.font = '500 48px Georgia, "DejaVu Sans", serif';
    context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 384, 50);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const object = mesh(parent, new THREE.PlaneGeometry(size * 8, size), material, [x, y, z]);
    object.name = `Label-${text}`; return object;
  }
  function dot(parent: THREE.Group, x: number, y: number, radius = .045, material: THREE.Material = pale, z = .12) {
    return mesh(parent, new THREE.SphereGeometry(radius, 12, 8), material, [x, y, z]);
  }
  function ticks(parent: THREE.Group, radius: number, count = 120, major = 10) {
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count;
      const inner = radius - (i % major === 0 ? .12 : .045);
      positions.push(Math.cos(angle) * inner, Math.sin(angle) * inner, .035, Math.cos(angle) * radius, Math.sin(angle) * radius, .035);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    parent.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: '#b99457', transparent: true, opacity: .8 })));
  }
  function dial(parent: THREE.Group, radius = 2.3, houses = true) {
    const chart = new THREE.Group(); chart.name = 'Twelve-sign-ecliptic'; parent.add(chart);
    const disc = mesh(chart, new THREE.CylinderGeometry(radius, radius, .055, 96), ink, [0, 0, -.07]); disc.rotation.x = Math.PI / 2;
    ring(chart, radius, .035); ring(chart, radius - .11, .009); ring(chart, radius - .5, .014); ticks(chart, radius - .15);
    const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    for (let i = 0; i < 12; i++) {
      const a = Math.PI / 2 + i * Math.PI / 6;
      segment(chart, [Math.cos(a) * (radius - .5), Math.sin(a) * (radius - .5)], [Math.cos(a) * radius, Math.sin(a) * radius], brass, .007);
      label(chart, signs[i] + '\uFE0E', Math.cos(a + Math.PI / 12) * (radius - .32), Math.sin(a + Math.PI / 12) * (radius - .32), .19);
      if (houses) {
        const house = segment(chart, [Math.cos(a) * .5, Math.sin(a) * .5], [Math.cos(a) * (radius - .53), Math.sin(a) * (radius - .53)], brass, .005);
        house.name = `House-${i + 1}`;
        label(chart, String(i + 1).padStart(2, '0'), Math.cos(a + Math.PI / 12) * (radius - .79), Math.sin(a + Math.PI / 12) * (radius - .79), .10, '#b99c69');
      }
    }
    if (houses) ring(chart, .48, .008);
    return chart;
  }
  function aspect(parent: THREE.Group, a: number, b: number, radius: number, material: THREE.Material = blue) {
    const p = (angle: number) => [Math.cos(angle) * radius, Math.sin(angle) * radius, .09];
    segment(parent, p(a), p(b), material, .007); dot(parent, p(a)[0], p(a)[1], .04, material); dot(parent, p(b)[0], p(b)[1], .04, material);
  }
  function sun(parent: THREE.Group, radius = .3) {
    const group = new THREE.Group(); group.name = 'Surya-Sun'; parent.add(group);
    dot(group, 0, 0, radius, new THREE.MeshBasicMaterial({ color: '#edc47b' })); ring(group, radius * 1.3, .012, .13);
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8;
      segment(group, [Math.cos(a) * radius * 1.6, Math.sin(a) * radius * 1.6, .1], [Math.cos(a) * radius * 1.95, Math.sin(a) * radius * 1.95, .1], brass, .01);
    }
    return group;
  }
  function moon(parent: THREE.Group, radius: number, phase: number, x = 0, y = 0) {
    // A shaded sphere with a phase terminator, rather than eight identical balls.
    const geometry = new THREE.SphereGeometry(radius, 56, 40);
    const normals = geometry.attributes.normal;
    const values: number[] = [];
    const light = new THREE.Vector3(Math.sin(phase), 0, -Math.cos(phase));
    for (let i = 0; i < normals.count; i++) {
      const normal = new THREE.Vector3().fromBufferAttribute(normals, i);
      const illumination = Math.max(0, normal.dot(light));
      const texture = .84 + .08 * Math.sin(normal.x * 39 + normal.y * 27) * Math.sin(normal.z * 29 - normal.y * 19) + .06 * Math.sin(normal.x * 73 + normal.z * 41);
      const intensity = (.055 + .945 * Math.pow(illumination, .55)) * texture;
      values.push(intensity * .92, intensity * .92, intensity * .88);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(values, 3));
    const grain = [];
    for (let i = 0; i < normals.count; i++) {
      const x = normals.getX(i), y = normals.getY(i), z = normals.getZ(i);
      grain.push(.84 + .08 * Math.sin(x * 39 + y * 27) * Math.sin(z * 29 - y * 19) + .06 * Math.sin(x * 73 + z * 41));
    }
    geometry.setAttribute('lunarGrain', new THREE.Float32BufferAttribute(grain, 1));
    const object = mesh(parent, geometry, new THREE.MeshBasicMaterial({ vertexColors: true }), [x, y, .18]); object.name = 'Chandra-Moon'; return object;
  }
  function pointer(parent: THREE.Group, radius: number, speed = .035, material: THREE.Material = brass) {
    const hand = new THREE.Group(); hand.name = 'Moving-transit-indicator'; hand.userData.motion = 'rotate'; hand.userData.speed = speed;
    segment(hand, [0, 0, .14], [radius, 0, .14], material, .011); dot(hand, radius, 0, .06, material, .15); parent.add(hand); return hand;
  }
  function kundli(parent: THREE.Group, size = 1.75) {
    const chart = new THREE.Group(); chart.name = 'North-Indian-kundli'; parent.add(chart);
    const s = size;
    mesh(chart, new THREE.BoxGeometry(s * 2 + .14, s * 2 + .14, .10), ink, [0, 0, -.08]);
    stroke(chart, [[-s, s], [s, s], [s, -s], [-s, -s]], brass, .025, true);
    stroke(chart, [[0, s], [s, 0], [0, -s], [-s, 0]], brass, .013, true);
    segment(chart, [-s, s], [s, -s]); segment(chart, [s, s], [-s, -s]);
    const positions = [[0, .65], [-.56, .88], [-.88, .56], [-.65, 0], [-.88, -.56], [-.56, -.88], [0, -.65], [.56, -.88], [.88, -.56], [.65, 0], [.88, .56], [.56, .88]];
    positions.forEach(([x, y], i) => label(chart, String(i + 1), x * s, y * s, .14));
    label(chart, 'LAGNA', 0, .3 * s, .10, '#8fb8c6');
    label(chart, '☉', -.34 * s, -.06 * s, .22); label(chart, '☽', .35 * s, -.13 * s, .22);
    return chart;
  }

  // Every scene uses real depth: raised brass lines, separate engraved plates,
  // suspended rings and lights, with one coherent focal composition per page.
  function turning(parent: THREE.Group, speed = .035) {
    const group = new THREE.Group(); parent.add(group);
    group.userData.motion = 'rotate'; group.userData.speed = speed;
    return group;
  }
  function lotus(parent: THREE.Group, petals = 12, radius = 1.7) {
    const flower = new THREE.Group(); flower.name = 'Padma-lotus'; parent.add(flower);
    for (let i = 0; i < petals; i++) {
      const petal = new THREE.Group(); flower.add(petal); petal.rotation.z = i * Math.PI * 2 / petals;
      stroke(petal, [[0, .3, .04], [-.35, radius * .55, .18], [0, radius, .05], [.35, radius * .55, .18], [0, .3, .04]], brass, .016, true, true);
    }
    ring(flower, .32, .025, .12); dot(flower, 0, 0, .09);
    return flower;
  }
  // Original raised, enamelled geometry inspired by the supplied references.
  function enamelWheel(parent: THREE.Group, radius = 2.65) {
    const wheel = dial(parent, radius, false); wheel.name = 'Enamel-zodiac-wheel';
    const palette = ['#b98372', '#bba56c', '#72aaa2', '#668eaf', '#9980ad', '#bc859b'];
    for (let i = 0; i < 12; i++) {
      const tile = mesh(wheel, new THREE.RingGeometry(radius - .48, radius - .04, 12, 1, i * Math.PI / 6, Math.PI / 6 - .016),
        new THREE.MeshStandardMaterial({ color: palette[(i + edition) % palette.length], metalness: .3, roughness: .4, side: THREE.DoubleSide }), [0, 0, -.015]);
      tile.name = `Enamel-sign-${i + 1}`;
    }
    const outer = turning(parent, -.018); nakshatra(outer, radius + .24);
    pointer(wheel, radius - .62, .028);
    return wheel;
  }
  function southChart(parent: THREE.Group, size = 2.1) {
    const chart = new THREE.Group(); chart.name = 'South-Indian-twelve-house-chart'; parent.add(chart);
    mesh(chart, new THREE.BoxGeometry(size * 2 + .12, size * 2 + .12, .12), ink, [0, 0, -.12]);
    stroke(chart, [[-size, size], [size, size], [size, -size], [-size, -size]], brass, .028, true);
    const cell = size / 2;
    for (let i = 1; i < 4; i++) {
      const offset = -size + i * cell;
      segment(chart, [offset, size], [offset, size - cell]);
      segment(chart, [offset, -size], [offset, -size + cell]);
      segment(chart, [-size, offset], [-size + cell, offset]);
      segment(chart, [size, offset], [size - cell, offset]);
    }
    stroke(chart, [[-cell, cell], [cell, cell], [cell, -cell], [-cell, -cell]], brass, .015, true);
    const names = ['PISCES', 'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS'];
    const cells = [[-1.5,1.5],[-.5,1.5],[.5,1.5],[1.5,1.5],[1.5,.5],[1.5,-.5],[1.5,-1.5],[.5,-1.5],[-.5,-1.5],[-1.5,-1.5],[-1.5,-.5],[-1.5,.5]];
    cells.forEach(([x,y], i) => { label(chart, names[i], x * cell, y * cell + .17, .085); label(chart, String(i + 1), x * cell, y * cell - .12, .14, '#87b5cb'); });
    sun(chart, .24); return chart;
  }
  function enamelLotus(parent: THREE.Group, count = 12) {
    const flower = new THREE.Group(); flower.name = 'Sculpted-lotus-mandala'; parent.add(flower);
    for (let layer = 0; layer < 3; layer++) {
      const band = turning(flower, (layer % 2 ? -1 : 1) * .014); band.position.z = layer * .15;
      for (let i = 0; i < count; i++) {
        const petal = new THREE.Shape(); petal.moveTo(0, .22);
        const length = 2.35 - layer * .47, width = .47 - layer * .08;
        petal.bezierCurveTo(-width, .9, -width, length * .78, 0, length);
        petal.bezierCurveTo(width, length * .78, width, .9, 0, .22);
        const material = new THREE.MeshStandardMaterial({ color: ['#b88443', '#d4a35c', '#d59d80'][layer], metalness: .48, roughness: .36 });
        const leaf = mesh(band, new THREE.ExtrudeGeometry(petal, { depth: .065, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 2, steps: 1, curveSegments: 12 }), material);
        leaf.rotation.z = (i + layer * .5) * Math.PI * 2 / count;
      }
    }
    sun(flower, .25); return flower;
  }
  function meditation(parent: THREE.Group) {
    const figure = new THREE.Group(); figure.name = 'Meditation-constellation'; parent.add(figure);
    const line = (points: number[][], width = .018) => stroke(figure, points, pale, width, false, true);
    // A seated figure drawn as a dimensional brass constellation.
    line([[-.34,1.23],[-.4,1.65],[-.25,1.98],[0,2.08],[.25,1.98],[.4,1.65],[.34,1.23]]);
    line([[-.34,1.55],[-.28,1.25],[0,1.1],[.28,1.25],[.34,1.55]], .012);
    line([[-.24,1.55],[-.15,1.52],[-.07,1.55]], .009);
    line([[.07,1.55],[.15,1.52],[.24,1.55]], .009);
    line([[0,1.53],[-.04,1.38],[.04,1.36]], .008);
    line([[-.1,1.26],[0,1.24],[.1,1.26]], .009);
    for (const side of [-1, 1]) {
      const mirror = (points: number[][]) => points.map(([x,y]) => [x * side,y,.16]);
      line(mirror([[.3,1.3],[.64,1.05],[.77,.45],[1.22,-.12],[1.75,-.35],[1.9,-.2]]));
      line(mirror([[.26,1.14],[.4,.4],[.57,-.16],[1.45,-.63],[1.62,-1.05],[.95,-1.26],[0,-1.08]]));
      line(mirror([[.56,-.17],[1.12,-.34],[1.82,-.76],[1.78,-1.02],[.92,-1.12],[0,-.69]]));
      line(mirror([[.23,1.99],[.57,1.68],[.49,1.1],[.7,.7]]), .01);
      for (let i = 0; i < 4; i++) line(mirror([[.3 + i * .07,1.9],[.43 + i * .07,1.52],[.35 + i * .07,1.15]]), .006);
    }
    for (let i = 0; i < 7; i++) { const chakra = dot(figure, 0, 1.48 - i * .3, .045, i % 2 ? rose : blue, .24); pulse(chakra, i, .3); }
    const halo = enamelWheel(parent, 2.6); halo.position.z = -.5;
    figure.position.z = .3; figure.userData.float = true;
    return figure;
  }
  function nakshatra(parent: THREE.Group, radius = 2.9) {
    const band = turning(parent, -.012); band.name = 'Twenty-seven-nakshatra-divisions';
    ring(band, radius, .012); ring(band, radius + .13, .006, -.08); ticks(band, radius + .08, 108, 4);
    for (let i = 0; i < 27; i++) {
      const a = i * Math.PI * 2 / 27;
      dot(band, Math.cos(a) * radius, Math.sin(a) * radius, i % 3 === 0 ? .035 : .02, pale);
    }
    return band;
  }
  function yantra(parent: THREE.Group, layers = 5) {
    const yantra = new THREE.Group(); yantra.name = 'Interlocking-yantra-geometry'; parent.add(yantra);
    for (let i = 0; i < layers; i++) {
      const triangle = new THREE.Group(); yantra.add(triangle); triangle.rotation.z = i % 2 ? Math.PI : 0;
      const radius = 2.1 - i * .23;
      stroke(triangle, [[0, radius, i * .08], [-radius * .866, -radius * .5, i * .08], [radius * .866, -radius * .5, i * .08]], brass, .016, true);
    }
    lotus(yantra, 16, 2.45); ring(yantra, 2.65, .025, -.12);
    return yantra;
  }
  function pulse(object: THREE.Object3D, phase = 0, amount = .09) {
    object.userData.pulse = { phase, amount };
  }
  function chartLights(parent: THREE.Group, count = 4) {
    for (let i = 0; i < count; i++) {
      const a = Math.PI * 2 * i / count + .3;
      const bead = dot(parent, Math.cos(a) * 1.25, Math.sin(a) * 1.25, .06, i % 2 ? pale : blue, .22);
      pulse(bead, i * 1.3, .35);
    }
  }
  const focus = new THREE.Group(); focus.name = `Motif-${motif}-${edition}`; root.add(focus);
  switch (motif) {
    case 'home': {
      enamelWheel(focus, 2.7);
      const flower = enamelLotus(focus, 12); flower.scale.setScalar(.55); flower.position.z = .2;
      break;
    }
    case 'about': {
      southChart(focus, 1.95);
      const backing = southChart(focus, 1.95); backing.position.set(.22, .2, -.5); backing.rotation.z = .07;
      nakshatra(focus); chartLights(focus, 5);
      break;
    }
    case 'services': {
      // Seven physical luminaries and two opposed symbolic lunar nodes.
      sun(focus, .55);
      const names = ['CHANDRA', 'BUDHA', 'SHUKRA', 'MANGALA', 'GURU', 'SHANI'];
      const colors = ['#d9d7cc', '#99bca5', '#edcda2', '#b77355', '#c7a56b', '#a99f87'];
      const band = turning(focus, .022); band.name = 'Navagraha';
      ring(focus, 2, .012); ring(focus, 2.65, .02);
      for (let i = 0; i < names.length; i++) {
        const a = i * Math.PI / 3;
        const planet = new THREE.Group(); band.add(planet); planet.position.set(Math.cos(a) * 2, Math.sin(a) * 2, .25 + (i % 2) * .25);
        dot(planet, 0, 0, .17 + i * .018, new THREE.MeshStandardMaterial({ color: colors[i], metalness: .25, roughness: .5 }));
        if (i === 5) { const rings = ring(planet, .4, .025, 0); rings.rotation.x = .7; }
      }
      for (const direction of [-1, 1]) {
        const node = ring(focus, .13, .025, .18, blue); node.position.x = direction * 2.65;
      }
      nakshatra(focus, 3); break;
    }
    case 'how-it-works':
    case 'preparation': {
      for (let i = 0; i < (motif === 'preparation' ? 2 : 3); i++) {
        const layer = kundli(focus, motif === 'preparation' ? 1.85 : 1.65); layer.position.set(i * .17, i * .12, -i * .45);
        layer.userData.assemble = { phase: i * 1.4, base: -i * .45 };
      }
      const lagna = dot(focus, 0, 1.05, .09, pale, .2); pulse(lagna, 0, .4);
      const arc = nakshatra(focus, 2.8); arc.rotation.x = .18;
      segment(focus, [-2.7, 0, .3], [2.7, 0, .3], blue, .008);
      break;
    }
    case 'reviews':
    case 'love': {
      const count = motif === 'reviews' ? 3 : 2 + (edition % 2);
      for (let i = 0; i < count; i++) {
        const panel = kundli(focus, 1.25);
        panel.position.set((i - (count - 1) / 2) * 1.55, Math.sin(i * 2 + edition) * .45, i * .28);
        panel.scale.setScalar(count === 3 ? .7 : .9);
        panel.rotation.z = (i % 2 ? 1 : -1) * .10;
        chartLights(panel, 2 + edition);
      }
      const thread = turning(focus, .018 + edition * .004); thread.rotation.x = .25;
      ring(thread, 2.6, .012, -.3); pointer(thread, 2.6, .04 + edition * .006, rose);
      if (edition > 1) lotus(focus, 8 + edition, .65).position.y = -1.95;
      break;
    }
    case 'contact': {
      // A stylised brass horizon instrument with two intersecting planes.
      const face = enamelWheel(focus, 2.25); face.rotation.x = -.55;
      for (const [x, y] of [[1.1, 0], [0, 1.1], [.7, .8]]) {
        const hoop = ring(focus, 2.7, .035); hoop.rotation.set(x, y, 0);
      }
      sun(focus, .28); pointer(face, 1.9, .045);
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        dot(focus, Math.cos(a) * 2.7, Math.sin(a) * 2.7, .07);
      }
      break;
    }
    case 'book': {
      const instrument = new THREE.Group(); focus.add(instrument); instrument.rotation.set(-.6, .15, -.15);
      enamelWheel(instrument, 2.4); ring(instrument, 1.75, .02); ticks(instrument, 1.7, 60, 5);
      const shape = new THREE.Shape(); shape.moveTo(-.8, 0); shape.lineTo(.8, 0); shape.lineTo(.15, 1.75); shape.closePath();
      const gnomon = mesh(instrument, new THREE.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2 }), brass, [0, 0, .12]);
      gnomon.rotation.x = Math.PI / 2;
      pointer(instrument, 2, .04, blue); nakshatra(focus, 2.9); break;
    }
    case 'horoscope':
    case 'moon': {
      nakshatra(focus, 3);
      for (let i = 0; i < 8; i++) {
        const a = Math.PI / 2 - i * Math.PI / 4;
        moon(focus, .26, i * Math.PI / 4, Math.cos(a) * 2.3, Math.sin(a) * 2.3);
      }
      const chandra = moon(focus, motif === 'moon' ? 1.15 : .9, Math.PI * .78); chandra.userData.phaseCycle = true;
      if (motif === 'moon') { const orbit = ring(focus, 1.6, .018); orbit.rotation.x = .65; }
      break;
    }
    case 'blog': {
      const paper = new THREE.MeshStandardMaterial({ color: '#8e7852', metalness: .25, roughness: .8 });
      for (let i = 0; i < 2; i++) {
        const leaf = mesh(focus, new THREE.BoxGeometry(2.3, 3.4, .12), paper, [(i ? 1 : -1) * 1.2, 0, -.2]); leaf.rotation.y = i ? -.12 : .12;
      }
      segment(focus, [0, -1.8], [0, 1.8], brass, .04);
      const chart = kundli(focus, 1.2); chart.scale.setScalar(.7); chart.position.set(-1.2, .1, .1);
      const flower = lotus(focus, 8, 1); flower.position.set(1.2, .1, .15); flower.scale.setScalar(.8);
      const engraving = nakshatra(focus, 2.85); engraving.rotation.x = .3;
      focus.rotation.z = -.08; break;
    }
    case 'faq': {
      meditation(focus); nakshatra(focus, 3.1); break;
    }
    case 'privacy': {
      southChart(focus, 1.65); chartLights(focus, 3);
      for (let i = 0; i < 3; i++) {
        const seal = new THREE.Group(); focus.add(seal); seal.position.z = -.3 - i * .23;
        const size = 1.85 + i * .18;
        stroke(seal, [[-size, size], [size, size], [size, -size], [-size, -size]], brass, .025, true);
        seal.rotation.z = i * .055;
      }
      const flower = lotus(focus, 8, .55); flower.position.set(1.5, -1.4, .35); pulse(flower, 0, .04); break;
    }
    case 'terms': {
      const chart = kundli(focus, 1.65); chart.rotation.z = Math.PI / 4; chart.scale.setScalar(.82);
      nakshatra(focus, 2.7);
      segment(focus, [0, -2.7, .2], [0, 2.7, .2], blue, .015);
      for (const x of [-1.65, 1.65]) { ring(focus, .22, .025, .2).position.x = x; }
      sun(focus, .22); break;
    }
    case 'readings': {
      const frame = enamelWheel(focus, 2.35); frame.rotation.x = -.15 - edition * .08;
      const chart = kundli(focus, 1.2); chart.rotation.z = edition * .12;
      for (let i = 0; i <= edition; i++) {
        const orbit = ring(focus, 2.55 + i * .09, .012, -.12 - i * .1); orbit.rotation.y = i * .18;
      }
      pointer(focus, 2.15, .025 + edition * .008); chartLights(chart, 2 + edition);
      if (edition % 2) moon(focus, .35, Math.PI * .7, 0, 1.65);
      break;
    }
    case 'spiritual': {
      const padma = enamelLotus(focus, 8 + edition * 2); padma.scale.setScalar(.85); padma.position.z = -.35;
      yantra(focus, 3 + edition);
      const band = nakshatra(focus, 2.95); band.rotation.x = edition * .07;
      for (let i = 0; i <= edition; i++) {
        const a = i * Math.PI * 2 / (edition + 1);
        pulse(dot(focus, Math.cos(a) * 2.55, Math.sin(a) * 2.55, .07, pale, .3), i, .3);
      }
      break;
    }
    case 'career': {
      sun(focus, .6 + edition * .045);
      const rays = turning(focus, .015 + edition * .006);
      const count = 12 + edition * 4;
      for (let i = 0; i < count; i++) {
        const a = i * Math.PI * 2 / count;
        segment(rays, [Math.cos(a) * 1.3, Math.sin(a) * 1.3], [Math.cos(a) * 2.15, Math.sin(a) * 2.15], brass, .018);
      }
      nakshatra(focus, 2.8);
      for (let i = 0; i <= edition; i++) ring(focus, 1 + i * .18, .012, -.15 - i * .1);
      break;
    }
    case 'wellbeing':
    case 'calm': {
      const petals = motif === 'calm' ? 16 : 8 + edition * 4;
      const flower = motif === 'calm' ? meditation(focus) : enamelLotus(focus, petals); pulse(flower, 0, .025);
      const chandra = moon(focus, .5 + edition * .15, Math.PI * .7); chandra.userData.phaseCycle = true;
      const halo = nakshatra(focus, 2.8); halo.rotation.x = motif === 'calm' ? .65 : .25;
      for (let i = 0; i < 2 + edition; i++) ring(focus, 2.4 + i * .16, .008, -.2 - i * .12);
      break;
    }
    default: kundli(focus);
  }
  // Sparse stars fill the viewport without unrelated edge decorations.
  // Use seeded positions so posters match the live scene.
  const dustPositions: number[] = [];
  for (let i = 0; i < 100; i++) {
    const rand = (n: number) => { const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
    dustPositions.push((rand(i + 1) - .5) * 15, (rand(i + 201) - .5) * 11, -1 - rand(i + 401) * 2);
  }
  const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#dec698', size: .022, transparent: true, opacity: .65, depthWrite: false })); root.add(dust);
  root.userData.motif = motif;
  root.userData.edition = edition;
  root.rotation.set(.07, -.10, 0);
  root.userData.theme = theme;
  return root;
}

export function animatePageArt(group: THREE.Group, elapsed: number) {
  // Keep diagrams readable. Animate the information-bearing indicators, not a
  // whole chart tumbling into an unreadable angle.
  group.rotation.y = -.10 + Math.sin(elapsed * .12) * .045;
  group.traverse(object => {
    if (object.userData.float) object.position.y = Math.sin(elapsed * .4) * .09;
    if (object.userData.motion === 'rotate') object.rotation.z = elapsed * object.userData.speed;
    if (object.userData.pulse) {
      const { phase, amount } = object.userData.pulse;
      object.scale.setScalar(1 + Math.sin(elapsed * .65 + phase) * amount);
    }
    if (object.userData.assemble) {
      const { phase, base } = object.userData.assemble;
      object.position.z = base + Math.sin(elapsed * .4 + phase) * .13;
    }
    if (object instanceof THREE.Mesh && object.userData.phaseCycle) shadeMoonGeometry(object.geometry, Math.PI * .78 + elapsed * .13);
  });
}

export function disposePageArt(group: THREE.Group) {
  const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
  const geometries = new Set<THREE.BufferGeometry>();
  group.traverse(object => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) {
      geometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
        materials.add(material);
        const map = (material as THREE.MeshBasicMaterial).map; if (map) textures.add(map);
      });
    }
  });
  geometries.forEach(geometry => geometry.dispose()); textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose());
}
