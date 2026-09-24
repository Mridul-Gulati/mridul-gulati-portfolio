// Wireframe scene for GeometricField: pure geometry, projection and drawing (no React).
// Kept separate so the composition can be previewed and tuned outside the app.

// ---------- geometry ----------

const PHI = (1 + Math.sqrt(5)) / 2;

// Edges = vertex pairs at the shortest non-zero distance (works for regular solids).
function edgesByMinDistance(vertices) {
  const d2 = (a, b) => a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0);
  let min = Infinity;
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++) min = Math.min(min, d2(vertices[i], vertices[j]));
  const edges = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      if (Math.abs(d2(vertices[i], vertices[j]) - min) < 1e-6) edges.push([i, j]);
  return edges;
}

function normalise(vertices) {
  const max = Math.max(...vertices.map((v) => Math.hypot(...v)));
  return vertices.map((v) => v.map((c) => c / max));
}

// 4D hypercube: 16 vertices, 32 edges. Rotated in 4D, then projected to 3D.
const tesseract = (() => {
  const vertices = [];
  for (let i = 0; i < 16; i++) vertices.push([0, 1, 2, 3].map((bit) => ((i >> bit) & 1 ? 1 : -1)));
  return { vertices, edges: edgesByMinDistance(vertices) };
})();

const icosahedron = (() => {
  const v = [];
  for (const a of [-1, 1]) for (const b of [-PHI, PHI]) v.push([0, a, b], [a, b, 0], [b, 0, a]);
  const vertices = normalise(v);
  return { vertices, edges: edgesByMinDistance(vertices) };
})();

const octahedron = (() => {
  const vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  return { vertices, edges: edgesByMinDistance(vertices) };
})();

function torus(major = 1, minor = 0.38, rings = 18, sides = 8) {
  const vertices = [];
  const edges = [];
  for (let i = 0; i < rings; i++) {
    const u = (i / rings) * Math.PI * 2;
    for (let j = 0; j < sides; j++) {
      const v = (j / sides) * Math.PI * 2;
      const r = major + minor * Math.cos(v);
      vertices.push([r * Math.cos(u), minor * Math.sin(v), r * Math.sin(u)]);
      const here = i * sides + j;
      edges.push([here, i * sides + ((j + 1) % sides)]); // around the tube
      edges.push([here, ((i + 1) % rings) * sides + j]); // along the ring
    }
  }
  return { vertices: normalise(vertices), edges };
}

// ---------- maths ----------

function rotate3(v, ax, ay, az) {
  let [x, y, z] = v;
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

// Rotate a 4D point in the XW and ZW planes, then perspective-project w away.
function project4to3([x, y, z, w], a, b) {
  let c = Math.cos(a), s = Math.sin(a);
  [x, w] = [x * c - w * s, x * s + w * c];
  c = Math.cos(b); s = Math.sin(b);
  [z, w] = [z * c - w * s, z * s + w * c];
  const k = 1 / (3 - w);
  return [x * k * 1.6, y * k * 1.6, z * k * 1.6];
}

// ---------- scene ----------
// Positions and sizes are fractions of the canvas; speeds are radians per second.
// The tesseract's projected half-extent reaches ~1.7 x size, so satellites sit clear of it.
const scene = [
  { shape: tesseract, four: true, x: 0.5, y: 0.5, size: 0.19, speed: [0.09, 0.14, 0.04], speed4: [0.19, 0.11], float: 0.01, phase: 0 },
  { shape: icosahedron, x: 0.83, y: 0.16, size: 0.085, speed: [0.17, 0.23, 0.07], float: 0.016, phase: 1.3 },
  { shape: torus(), x: 0.17, y: 0.83, size: 0.11, speed: [0.27, 0.1, 0.06], float: 0.018, phase: 2.4, tilt: 1.1 },
  { shape: octahedron, x: 0.87, y: 0.8, size: 0.05, speed: [0.26, 0.34, 0.12], float: 0.02, phase: 3.7 },
  { shape: icosahedron, x: 0.14, y: 0.19, size: 0.035, speed: [0.36, 0.21, 0.26], float: 0.022, phase: 4.6 },
];

function drawShape(ctx, item, t, w, h, color) {
  const unit = Math.min(w, h);
  const cx = item.x * w;
  const cy = item.y * h + Math.sin(t * 0.6 + item.phase) * item.float * unit;
  const radius = item.size * unit;
  const [sx, sy, sz] = item.speed;

  const points = item.shape.vertices.map((v) => {
    let p = item.four ? project4to3(v, t * item.speed4[0], t * item.speed4[1]) : v;
    p = rotate3(p, (item.tilt ?? 0) + t * sx, t * sy, t * sz);
    const perspective = 3.2 / (3.2 + p[2]); // camera looking down -z
    return { x: cx + p[0] * radius * perspective, y: cy + p[1] * radius * perspective, z: p[2] };
  });

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // Edges: nearer edges stronger, far edges fade, which reads as depth.
  for (const [a, b] of item.shape.edges) {
    const pa = points[a], pb = points[b];
    const depth = ((pa.z + pb.z) / 2 + 1.2) / 2.4; // ~0 (near) .. 1 (far)
    ctx.globalAlpha = 0.85 - Math.min(Math.max(depth, 0), 1) * 0.7;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Vertex dots, skipped on the dense torus to keep it airy.
  if (item.shape.vertices.length <= 20) {
    for (const p of points) {
      ctx.globalAlpha = 0.9 - ((p.z + 1.2) / 2.4) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Draws the whole composition at time t (seconds) onto a context sized w x h (CSS px).
export function drawScene(ctx, t, w, h, color) {
  ctx.clearRect(0, 0, w, h);
  for (const item of scene) drawShape(ctx, item, t, w, h, color);
  ctx.globalAlpha = 1;
}
