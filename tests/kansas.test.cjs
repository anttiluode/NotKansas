// Not Kansas ledger: the hyperbolic moon. Run: node tests/kansas.test.cjs   (a few seconds)
'use strict';
const CM = require('../core.js');
const results = [];
function ok(name, cond, detail) { results.push(!!cond); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); }
const { c, rho2 } = CM.HONEY, rho = Math.sqrt(rho2);

// H1: the cube is the {4,3,5} cube
{
  // two adjacent faces meet on the plane x = y; the region outside both spheres has dihedral angle 2π/5
  const t = (2 * c - Math.sqrt(4 * c * c - 8 * (c * c - rho2))) / 4, P = [t, t];
  const n1 = [(P[0] - c) / rho, P[1] / rho], n2 = [P[0] / rho, (P[1] - c) / rho];
  const ang = (Math.PI - Math.acos(n1[0] * n2[0] + n1[1] * n2[1])) * 180 / Math.PI;
  const inr = 2 * Math.atanh(c - rho);
  const vtx = (2 * c - Math.sqrt(4 * c * c - 12 * (c * c - rho2))) / 6, circ = 2 * Math.atanh(vtx * Math.sqrt(3));
  ok('H1 the central cube: faces meet the boundary at right angles, dihedral angle 72° (five cubes round an edge), in- and circumradius of the {4,3,5} cube',
    Math.abs(c * c - 1 - rho2) < 1e-12 && Math.abs(ang - 72) < 1e-9 && Math.abs(inr - 0.5306375309525179) < 1e-9 && Math.abs(circ - 1.2264568712514068) < 1e-9,
    `c² − 1 − ρ² = ${(c * c - 1 - rho2).toExponential(1)}, dihedral ${ang.toFixed(9)}°, inradius ${inr.toFixed(10)}, circumradius ${circ.toFixed(10)}`);
}
// H2: the fold lands in the chamber and is an isometry piece by piece
{
  let outside = 0, worst = 0, maxK = 0, n = 0;
  for (let k = 0; k < 4000; k++) {
    const u = (j) => CM.rnd(k, j);
    const dir = [u(1) - 0.5, u(2) - 0.5, u(3) - 0.5], dn = Math.hypot(...dir), r = Math.tanh(0.5 * 4.5 * u(4));   // hyperbolic radius up to 4.5
    const a = dir.map((t) => t / dn * r);
    const b = a.map((t, j) => t + 1e-4 * (1 - r * r) * (u(5 + j) - 0.5));
    const A = CM.fold(a), B = CM.fold(b);
    const p = A.p, inCh = p[0] >= p[1] - 1e-12 && p[1] >= p[2] - 1e-12 && p[2] >= -1e-12 && (p[0] - c) ** 2 + p[1] ** 2 + p[2] ** 2 >= rho2 - 1e-9;
    if (!inCh) outside++;
    maxK = Math.max(maxK, A.k);
    if (A.k === B.k && Math.abs(A.p[0] - A.p[1]) > 1e-3 && Math.abs(A.p[1] - A.p[2]) > 1e-3 && A.p[2] > 1e-3) {
      worst = Math.max(worst, Math.abs(CM.hypDist(A.p, B.p) - CM.hypDist(a, b)) / CM.hypDist(a, b)); n++;
    }
  }
  ok('H2 fold(): every point of the ball lands in one chamber of the central cube, and the fold keeps hyperbolic distances',
    outside === 0 && worst < 1e-5, `4000 points out to hyperbolic radius 4.5: ${outside} outside the chamber; up to ${maxK} cube faces crossed; ${n} nearby pairs, worst relative distance change ${worst.toExponential(1)}`);
}
// H3: the march follows geodesics: points stay on one circle orthogonal to the boundary, and the wall is never reached
{
  let worst = 0, maxR = 0;
  for (let k = 0; k < 50; k++) {
    const u = (j) => CM.rnd(500 + k, j);
    const x0 = [0.6 * (u(1) - 0.5), 0.6 * (u(2) - 0.5), 0.6 * (u(3) - 0.5)], d0 = [u(4) - 0.5, u(5) - 0.5, u(6) - 0.5], dn = Math.hypot(...d0);
    const pts = CM.geodesic(x0, d0.map((t) => t / dn), 0.002, 4000);
    // a geodesic is a circle (or line) in a plane through the centre, orthogonal to the unit sphere: |q|² − 2 q·o + 1 = 0
    // for its centre o in that plane. Fit o from the first point and direction, then test every point.
    const p = pts[0], q = pts[1], d = q.map((t, i) => t - p[i]); const dl = Math.hypot(...d); const t0 = d.map((v) => v / dl);
    // centre o = p + s m with m ⟂ t0 in the plane of p, t0 and 0; solve |o|² = 1 + s² (orthogonality)
    const pt = p[0] * t0[0] + p[1] * t0[1] + p[2] * t0[2];
    let m = p.map((v, i) => v - pt * t0[i]); const mn = Math.hypot(...m);
    if (mn < 1e-9) continue;                                  // a diameter: a straight line
    m = m.map((v) => v / mn);
    const p2 = p[0] ** 2 + p[1] ** 2 + p[2] ** 2, pm = p[0] * m[0] + p[1] * m[1] + p[2] * m[2];
    const s = (1 - p2) / (2 * pm), o = p.map((v, i) => v + s * m[i]), R = Math.abs(s);
    for (const pp of pts) {
      worst = Math.max(worst, Math.abs(Math.hypot(pp[0] - o[0], pp[1] - o[1], pp[2] - o[2]) - R) / R);
      maxR = Math.max(maxR, Math.hypot(...pp));
    }
  }
  ok('H3 the bent rays are hyperbolic geodesics: each stays on a circle meeting the boundary at right angles, and never reaches the wall',
    worst < 2e-3 && maxR < 1, `50 rays, 8 units of hyperbolic length each: worst relative distance from the geodesic circle ${worst.toExponential(1)}; farthest point r = ${maxR.toFixed(6)}`);
}
console.log(`\n${results.filter(Boolean).length}/${results.length} pass`);
if (results.some((r) => !r)) process.exit(1);
