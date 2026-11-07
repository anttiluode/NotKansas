// Gardam's unit, checked. Run: node tests/kaplansky.test.cjs
'use strict';
const K = require('../kaplansky.js');
const res = [];
function ok(n, c, d) { res.push(!!c); console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`); }
const { A, B, E, X, Y, Z, mul, inv, eq, word, pow, act, key } = K;
ok('K1 the affine maps satisfy the presentation of P: b⁻¹a²b = a⁻² and a⁻¹b²a = b⁻²',
  eq(word(inv(B), pow(A, 2), B), pow(A, -2)) && eq(word(inv(A), pow(B, 2), A), pow(B, -2)),
  `a² = translation by ${X.t.map((t) => t / 2)}, b² by ${Y.t.map((t) => t / 2)}, z = (ab)² by ${Z.t.map((t) => t / 2)}`);
// torsion-free and free: no element of a big ball fixes a point (an affine map v ↦ Dv + t/2 has a fixed point iff t_i = 0 wherever d_i = 1)
{
  const seen = new Map(); let frontier = [E]; seen.set(key(E), E);
  for (let r = 0; r < 7; r++) { const nf = []; for (const g of frontier) for (const s of [A, B, inv(A), inv(B)]) { const h = mul(g, s), k = key(h); if (!seen.has(k)) { seen.set(k, h); nf.push(h); } } frontier = nf; }
  let fixed = 0;
  for (const g of seen.values()) { if (eq(g, E)) continue; if (g.d.every((d, i) => d === -1 || g.t[i] === 0)) fixed++; }
  ok('K2 P acts freely: no element of the ball of radius 7 (except 1) fixes any point, so P is torsion-free', fixed === 0, `${seen.size} elements checked, ${fixed} with a fixed point`);
}
const a = K.alpha, ap = K.alphaP;
const one = (m) => m.size === 1 && m.has(key(E));
const prod = K.times(a, ap), prod2 = K.times(ap, a);
ok('K3 Gardam\'s unit: α α′ = 1 and α′ α = 1 in F₂[P]', one(prod) && one(prod2), `|α| = ${a.size} terms, |α′| = ${ap.size} terms; α α′ has ${prod.size} term(s), α′ α has ${prod2.size}`);
const Zp = K.timesZ(a, ap); let even = 0, odd = 0, maxc = 0; for (const v of Zp.values()) { if (v.c % 2) odd++; else even++; maxc = Math.max(maxc, v.c); }
ok('K4 it needs 1 + 1 = 0: of the 441 products, all but one land on group elements an even number of times',
  [...Zp.values()].reduce((t, v) => t + v.c, 0) === a.size * ap.size && odd === 1 && Zp.get(key(E)).c % 2 === 1,
  `441 products land on ${Zp.size} elements: ${even} hit an even number of times (cancel mod 2), ${odd} odd (the identity, hit ${Zp.get(key(E)).c}×); most hits on one element ${maxc}`);
{
  // drop any one term of α′ and the product is no longer 1
  let worst = Infinity;
  for (const k of ap.keys()) { const m = new Map(ap); m.delete(k); worst = Math.min(worst, K.times(a, m).size); }
  ok('K5 it is not an accident: remove any single term of α′ and α α′ is no longer 1', worst > 1, `smallest product after removing one term: ${worst} terms`);
}
ok('K6 α is not a trivial unit (not λg)', a.size > 1, `α has ${a.size} terms`);
console.log(`\n${res.filter(Boolean).length}/${res.length} pass`); if (res.some((r) => !r)) process.exit(1);
