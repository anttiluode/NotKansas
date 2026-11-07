/*  Kaplansky in a crystal group: Gardam's unit (Annals of Mathematics 194, 2021).
 *
 *  The group. P = ⟨a, b | b⁻¹a²b = a⁻², a⁻¹b²a = b⁻²⟩, the Hantzsche–Wendt group. It is a crystallographic
 *  (Bieberbach) group: it acts on ordinary 3-space by screw motions, freely, and R³/P is the closed flat
 *  3-manifold called the didicosm. It is torsion-free. Here every element is an exact affine map
 *      v ↦ D v + t/2,   D = diag(±1, ±1, ±1),   t ∈ Z³   (translations stored doubled, so all integer)
 *  with a(v) = (x + ½, ½ − y, −z) and b(v) = (−x, y + ½, ½ − z). Then a² = translation e₁ = x, b² = e₂ = y.
 *
 *  The unit. Over F₂ (coefficients 0 or 1, 1 + 1 = 0), with x = a², y = b², z = (ab)²,
 *      α  = p + q a + r b + s ab
 *      p = (1 + x)(1 + y)(1 + z⁻¹),  q = x⁻¹y⁻¹ + x + y⁻¹z + z,  r = 1 + x + y⁻¹z + xyz,  s = 1 + (x + x⁻¹ + y + y⁻¹) z⁻¹
 *      α′ = x⁻¹ pᵃ + x⁻¹ q a + y⁻¹ r b + z⁻¹ sᵃ ab          (ηᵃ = conjugation by a; signs vanish mod 2)
 *  and α α′ = 1. Kaplansky's unit conjecture said a torsion-free group ring has no units but λg. This is one.
 *  The formulas are Gardam's (Theorem A and Lemma 1, as restated); the conventions below are checked by the tests.
 */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.KAP = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // an element: { d: [±1,±1,±1], t: [int,int,int] } meaning v ↦ D v + t/2
  const E = { d: [1, 1, 1], t: [0, 0, 0] };
  const A = { d: [1, -1, -1], t: [1, 1, 0] };
  const B = { d: [-1, 1, -1], t: [0, 1, 1] };
  /** g·h = g ∘ h (apply h first). */
  function mul(g, h) { return { d: g.d.map((s, i) => s * h.d[i]), t: g.t.map((s, i) => s + g.d[i] * h.t[i]) }; }
  function inv(g) { return { d: g.d.slice(), t: g.t.map((s, i) => -g.d[i] * s) }; }
  function key(g) { return g.d.join(',') + '|' + g.t.join(','); }
  function eq(g, h) { return key(g) === key(h); }
  function word(...gs) { return gs.reduce(mul, E); }
  function pow(g, n) { let r = E; const b = n < 0 ? inv(g) : g; for (let i = 0; i < Math.abs(n); i++) r = mul(r, b); return r; }
  function act(g, v) { return v.map((s, i) => g.d[i] * s + g.t[i] / 2); }

  const X = pow(A, 2), Y = pow(B, 2), Z = pow(mul(A, B), 2);

  // ---------------------------------------------------------- the group ring F₂[P]: a set of elements (coefficient 1)
  // An element of F₂[P] is a Map key → element; adding toggles membership (1 + 1 = 0).
  function ring(list) { const m = new Map(); for (const g of list) add(m, g); return m; }
  function add(m, g) { const k = key(g); if (m.has(k)) m.delete(k); else m.set(k, g); return m; }
  function sum(...ms) { const r = new Map(); for (const m of ms) for (const g of m.values()) add(r, g); return r; }
  function times(m, n) { const r = new Map(); for (const g of m.values()) for (const h of n.values()) add(r, mul(g, h)); return r; }
  function left(g, m) { return ring([...m.values()].map((h) => mul(g, h))); }
  function right(m, g) { return ring([...m.values()].map((h) => mul(h, g))); }
  function conj(m, c) { return ring([...m.values()].map((h) => word(inv(c), h, c))); }    // ηᶜ = c⁻¹ η c
  /** The same product with integer coefficients: how many of the |m|·|n| products land on each element. */
  function timesZ(m, n) { const r = new Map(); for (const g of m.values()) for (const h of n.values()) { const p = mul(g, h), k = key(p); r.set(k, { g: p, c: (r.has(k) ? r.get(k).c : 0) + 1 }); } return r; }

  const I = ring([E]), x = ring([X]), y = ring([Y]), xi = ring([inv(X)]), yi = ring([inv(Y)]), zi = ring([inv(Z)]);
  const p = times(times(sum(I, x), sum(I, y)), sum(I, zi));
  const q = ring([word(inv(X), inv(Y)), X, word(inv(Y), Z), Z]);
  const r = ring([E, X, word(inv(Y), Z), word(X, Y, Z)]);
  const s = sum(I, times(ring([X, inv(X), Y, inv(Y)]), zi));
  const alpha = sum(p, right(q, A), right(r, B), right(s, mul(A, B)));
  const alphaP = sum(left(inv(X), conj(p, A)), right(left(inv(X), q), A), right(left(inv(Y), r), B), right(left(inv(Z), conj(s, A)), mul(A, B)));

  return { E, A, B, X, Y, Z, mul, inv, key, eq, word, pow, act, ring, add, sum, times, timesZ, p, q, r, s, alpha, alphaP };
});
