/**
 * calculators.js
 * 8 engineering calculators with standard mechanical engineering formulae.
 * All calculations in SI units internally; inputs/outputs in practical engineering units.
 */

'use strict';

/* ===========================
   RESULT DISPLAY HELPER
=========================== */
function showResult(id, html, isError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('show');
  if (isError) {
    el.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  } else {
    el.style.borderColor = '';
  }
}

function showError(id, msg) {
  showResult(id, `<div class="result-warn"><i class="fa-solid fa-triangle-exclamation"></i> ${msg}</div>`, true);
}

function fmtNum(val, decimals) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (Math.abs(val) >= 10000) return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return parseFloat(val.toFixed(decimals)).toString();
}

function resultGrid(items) {
  return `<div class="result-grid">${items.map(i =>
    `<div class="result-item">
      <span class="result-label">${i.label}</span>
      <span class="result-value">${i.value} <span class="result-unit">${i.unit}</span></span>
    </div>`
  ).join('')}</div>`;
}

function resultNote(formula, substitution) {
  return `<div class="result-note">
    <code>${formula}</code>${substitution ? '<br>' + substitution : ''}
  </div>`;
}

/* ===========================
   1. BOLT TORQUE
   T = K × F × d
   K: nut factor (dimensionless)
   F: clamping force (N)
   d: bolt diameter (m)
   T: tightening torque (Nm)
=========================== */
function calcBoltTorque() {
  const d_mm = parseFloat(document.getElementById('bolt-d').value);
  const F_kN = parseFloat(document.getElementById('bolt-f').value);
  const K    = parseFloat(document.getElementById('bolt-k').value);

  if (isNaN(d_mm) || isNaN(F_kN) || d_mm <= 0 || F_kN <= 0) {
    showError('res-bolt', 'Enter valid positive values for diameter and clamping force.');
    return;
  }

  const d = d_mm / 1000;      // m
  const F = F_kN * 1000;      // N

  const T   = K * F * d;                    // Nm
  const T_A = K * (F * 0.9) * d;           // 90% clamping — assembly torque guidance
  const Fkip = F / 4448.2;                  // kilonewtons → kip (for reference)

  const html = resultGrid([
    { label: 'Required Torque', value: fmtNum(T, 1),   unit: 'Nm' },
    { label: 'Approx. at 90% Clamp', value: fmtNum(T_A, 1), unit: 'Nm' },
    { label: 'Clamping Force', value: fmtNum(F / 1000, 2), unit: 'kN' },
  ]) + resultNote(
    `T = K × F × d = ${K} × ${fmtNum(F/1000, 1)} kN × ${d_mm} mm`,
    `K = ${K} | Use 10% torque scatter allowance in practice`
  );

  showResult('res-bolt', html);
}

/* ===========================
   2. PNEUMATIC CYLINDER FORCE
   Push (extend):  F_push = P × (π × D² / 4)
   Pull (retract): F_pull = P × π/4 × (D² − d²)
   P in bar → Pa (×10⁵), D and d in mm → m (÷1000)
=========================== */
function calcPneumatic() {
  const D_mm  = parseFloat(document.getElementById('pneu-d').value);
  const d_mm  = parseFloat(document.getElementById('pneu-rod').value);
  const P_bar = parseFloat(document.getElementById('pneu-p').value);

  if (isNaN(D_mm) || isNaN(d_mm) || isNaN(P_bar) || D_mm <= 0 || d_mm <= 0 || P_bar <= 0) {
    showError('res-pneu', 'Enter valid positive values for all fields.');
    return;
  }
  if (d_mm >= D_mm) {
    showError('res-pneu', 'Rod diameter must be smaller than bore diameter.');
    return;
  }

  const D = D_mm / 1000;
  const d = d_mm / 1000;
  const P = P_bar * 1e5;  // Pa

  const A_push = Math.PI * D * D / 4;
  const A_pull = Math.PI * (D * D - d * d) / 4;

  const F_push_N = P * A_push;
  const F_pull_N = P * A_pull;

  const F_push_kN = F_push_N / 1000;
  const F_pull_kN = F_pull_N / 1000;

  const html = resultGrid([
    { label: 'Push Force (Extend)', value: fmtNum(F_push_kN, 2), unit: 'kN' },
    { label: 'Pull Force (Retract)', value: fmtNum(F_pull_kN, 2), unit: 'kN' },
    { label: 'Bore Area', value: fmtNum(A_push * 1e6, 1), unit: 'mm²' },
    { label: 'Annular Area', value: fmtNum(A_pull * 1e6, 1), unit: 'mm²' },
  ]) + resultNote(
    `F_push = P × π × D² / 4 = ${P_bar} bar × π × ${D_mm}² / 4`,
    `Note: deduct 10–15% for friction and cylinder efficiency in practice`
  );

  showResult('res-pneu', html);
}

/* ===========================
   3. HYDRAULIC CYLINDER FORCE
   Same formula as pneumatic — higher pressures, SI Pa
=========================== */
function calcHydraulic() {
  const D_mm  = parseFloat(document.getElementById('hyd-d').value);
  const d_mm  = parseFloat(document.getElementById('hyd-rod').value);
  const P_bar = parseFloat(document.getElementById('hyd-p').value);

  if (isNaN(D_mm) || isNaN(d_mm) || isNaN(P_bar) || D_mm <= 0 || d_mm <= 0 || P_bar <= 0) {
    showError('res-hyd', 'Enter valid positive values for all fields.');
    return;
  }
  if (d_mm >= D_mm) {
    showError('res-hyd', 'Rod diameter must be smaller than bore diameter.');
    return;
  }

  const D = D_mm / 1000;
  const d = d_mm / 1000;
  const P = P_bar * 1e5;

  const A_push = Math.PI * D * D / 4;
  const A_pull = Math.PI * (D * D - d * d) / 4;

  const F_push_kN = (P * A_push) / 1000;
  const F_pull_kN = (P * A_pull) / 1000;

  const F_push_ton = F_push_kN / 9.81;  // metric tonne-force
  const F_pull_ton = F_pull_kN / 9.81;

  const html = resultGrid([
    { label: 'Push Force (Extend)', value: fmtNum(F_push_kN, 1), unit: 'kN' },
    { label: 'Pull Force (Retract)', value: fmtNum(F_pull_kN, 1), unit: 'kN' },
    { label: 'Push Force', value: fmtNum(F_push_ton, 2), unit: 'tf' },
    { label: 'Pull Force', value: fmtNum(F_pull_ton, 2), unit: 'tf' },
  ]) + resultNote(
    `F_push = P × π × D² / 4 = ${P_bar} bar × π × ${D_mm}² / 4`,
    `Deduct ≈15% for mechanical efficiency. 1 tf ≈ 9.81 kN`
  );

  showResult('res-hyd', html);
}

/* ===========================
   4. MOTOR POWER
   P_shaft = (2π × N × T) / 60    [W]
   P_input = P_shaft / η
   N: RPM, T: Nm, η: efficiency (fraction)
=========================== */
function calcMotor() {
  const N   = parseFloat(document.getElementById('motor-n').value);
  const T   = parseFloat(document.getElementById('motor-t').value);
  const eff = parseFloat(document.getElementById('motor-eff').value);

  if (isNaN(N) || isNaN(T) || isNaN(eff) || N <= 0 || T <= 0 || eff <= 0 || eff > 100) {
    showError('res-motor', 'Enter valid values. Efficiency must be between 1 and 100%.');
    return;
  }

  const eta       = eff / 100;
  const omega     = (2 * Math.PI * N) / 60;     // rad/s
  const P_shaft   = T * omega;                   // W
  const P_shaft_kW = P_shaft / 1000;
  const P_input_kW = P_shaft_kW / eta;
  const P_shaft_hp = P_shaft_kW * 1.34102;       // CV / HP

  const html = resultGrid([
    { label: 'Shaft Power', value: fmtNum(P_shaft_kW, 3), unit: 'kW' },
    { label: 'Motor Input Power', value: fmtNum(P_input_kW, 3), unit: 'kW' },
    { label: 'Shaft Power', value: fmtNum(P_shaft_hp, 3), unit: 'HP' },
    { label: 'Angular Velocity', value: fmtNum(omega, 2), unit: 'rad/s' },
  ]) + resultNote(
    `P = 2π × N × T / 60 = 2π × ${N} RPM × ${T} Nm / 60`,
    `At η = ${eff}%: Input = ${fmtNum(P_input_kW, 3)} kW | 1 HP ≈ 0.746 kW`
  );

  showResult('res-motor', html);
}

/* ===========================
   5. GEAR RATIO
   i = Z₂ / Z₁
   N₂ = N₁ / i
   T₂ = T₁ × i × η_gear  (η_gear ≈ 0.97 for spur/helical)
=========================== */
function calcGear() {
  const Z1 = parseFloat(document.getElementById('gear-z1').value);
  const Z2 = parseFloat(document.getElementById('gear-z2').value);
  const N1 = parseFloat(document.getElementById('gear-n1').value);
  const T1 = parseFloat(document.getElementById('gear-t1').value);

  if (isNaN(Z1) || isNaN(Z2) || isNaN(N1) || isNaN(T1) || Z1 <= 0 || Z2 <= 0 || N1 <= 0 || T1 <= 0) {
    showError('res-gear', 'Enter valid positive values for all fields.');
    return;
  }

  const eta_gear = 0.97;  // Typical spur/helical gear efficiency
  const i  = Z2 / Z1;
  const N2 = N1 / i;
  const T2 = T1 * i * eta_gear;

  const P1 = (2 * Math.PI * N1 * T1) / 60 / 1000;  // kW
  const P2 = (2 * Math.PI * N2 * T2) / 60 / 1000;  // kW

  const gearType = i > 1 ? 'Speed reduction (torque multiplication)' : i < 1 ? 'Speed increase (torque reduction)' : 'Direct drive (1:1)';

  const html = resultGrid([
    { label: 'Gear Ratio (i)', value: fmtNum(i, 3), unit: ':1' },
    { label: 'Output Speed', value: fmtNum(N2, 1), unit: 'RPM' },
    { label: 'Output Torque', value: fmtNum(T2, 2), unit: 'Nm' },
    { label: 'Input Power', value: fmtNum(P1, 3), unit: 'kW' },
  ]) + resultNote(
    `i = Z₂/Z₁ = ${Z2}/${Z1} = ${fmtNum(i,3)} | N₂ = ${fmtNum(N1,0)} / ${fmtNum(i,3)} = ${fmtNum(N2,1)} RPM`,
    `${gearType} | T₂ includes η = ${eta_gear} (spur/helical gear)`
  );

  showResult('res-gear', html);
}

/* ===========================
   6. PULLEY / BELT SPEED
   N₂ = N₁ × (D₁ / D₂)
   V_belt = π × D₁ × N₁ / 60  [m/s]
   Pulley ratio = D₂ / D₁
=========================== */
function calcPulley() {
  const D1 = parseFloat(document.getElementById('pul-d1').value);
  const D2 = parseFloat(document.getElementById('pul-d2').value);
  const N1 = parseFloat(document.getElementById('pul-n1').value);

  if (isNaN(D1) || isNaN(D2) || isNaN(N1) || D1 <= 0 || D2 <= 0 || N1 <= 0) {
    showError('res-pul', 'Enter valid positive values for all fields.');
    return;
  }

  const ratio   = D2 / D1;                         // Pulley ratio
  const N2      = N1 * (D1 / D2);                  // RPM
  const V_belt  = (Math.PI * (D1 / 1000) * N1) / 60;  // m/s
  const V_kmh   = V_belt * 3.6;

  const dir = N2 < N1 ? 'Speed reduction' : N2 > N1 ? 'Speed increase' : 'Equal speed';

  const html = resultGrid([
    { label: 'Driven Pulley Speed', value: fmtNum(N2, 1), unit: 'RPM' },
    { label: 'Belt Speed', value: fmtNum(V_belt, 2), unit: 'm/s' },
    { label: 'Pulley Ratio', value: fmtNum(ratio, 3), unit: ':1' },
    { label: 'Belt Speed', value: fmtNum(V_kmh, 1), unit: 'km/h' },
  ]) + resultNote(
    `N₂ = N₁ × D₁/D₂ = ${fmtNum(N1,0)} × ${D1}/${D2} = ${fmtNum(N2,1)} RPM`,
    `${dir} | V_belt = π × D₁ × N₁ / 60 = ${fmtNum(V_belt,2)} m/s`
    + (V_belt > 30 ? ' ⚠ Belt speed >30 m/s — check belt rating' : '')
  );

  showResult('res-pul', html);
}

/* ===========================
   7. BEARING L10 LIFE (ISO 281)
   L10 = (C / P) ^ p   [millions of revolutions]
   L10h = L10 × 10⁶ / (60 × n)  [hours]
   p = 3 for ball bearings, 10/3 for roller bearings
=========================== */
function calcBearing() {
  const C   = parseFloat(document.getElementById('bear-c').value);
  const P   = parseFloat(document.getElementById('bear-p').value);
  const n   = parseFloat(document.getElementById('bear-n').value);
  const exp = parseFloat(document.getElementById('bear-type').value);

  if (isNaN(C) || isNaN(P) || isNaN(n) || C <= 0 || P <= 0 || n <= 0) {
    showError('res-bear', 'Enter valid positive values for all fields.');
    return;
  }
  if (P >= C) {
    showError('res-bear', 'Equivalent load P must be less than dynamic load rating C. Bearing will not survive.');
    return;
  }

  const L10_mr  = Math.pow(C / P, exp);             // millions of revolutions
  const L10h    = (L10_mr * 1e6) / (60 * n);        // hours
  const L10_days = L10h / 24;
  const L10_yrs  = L10_days / 365.25;

  // Typical engineering targets: 20,000h (conveyor), 40,000h (machine tool)
  let note = '';
  if (L10h < 8000)  note = '⚠ Life below 8,000 h — consider larger bearing or reduce load.';
  else if (L10h < 20000) note = 'Acceptable for intermittent or light-duty applications. Target ≥20,000h for production machines.';
  else note = '✓ Satisfactory for continuous industrial service.';

  const html = resultGrid([
    { label: 'L10 Life', value: fmtNum(L10h, 0), unit: 'hours' },
    { label: 'L10 Life', value: fmtNum(L10_yrs, 1), unit: 'years' },
    { label: 'L10 (millions of rev)', value: fmtNum(L10_mr, 2), unit: '×10⁶ rev' },
    { label: 'C/P Ratio', value: fmtNum(C / P, 2), unit: '' },
  ]) + resultNote(
    `L10h = (C/P)^${exp === 3 ? 3 : '10/3'} × 10⁶ / (60 × n) = (${C}/${P})^${exp} × 10⁶ / (60 × ${n})`,
    note
  );

  showResult('res-bear', html);
}

/* ===========================
   8. BEAM DEFLECTION
   Simply supported beam, central point load (worst case)
   δ_max = F × L³ / (48 × E × I)
   F: N, L: m, E: Pa, I: m⁴ → δ: m
=========================== */
function calcBeam() {
  const F_kN   = parseFloat(document.getElementById('beam-f').value);
  const L_mm   = parseFloat(document.getElementById('beam-l').value);
  const E_GPa  = parseFloat(document.getElementById('beam-e').value);
  const I_cm4  = parseFloat(document.getElementById('beam-i').value);

  if (isNaN(F_kN) || isNaN(L_mm) || isNaN(E_GPa) || isNaN(I_cm4) ||
      F_kN <= 0 || L_mm <= 0 || I_cm4 <= 0) {
    showError('res-beam', 'Enter valid positive values for all fields.');
    return;
  }

  const F = F_kN * 1000;            // N
  const L = L_mm / 1000;            // m
  const E = E_GPa * 1e9;            // Pa
  const I = I_cm4 * 1e-8;           // m⁴  (1 cm⁴ = 10⁻⁸ m⁴)

  const delta_m  = (F * Math.pow(L, 3)) / (48 * E * I);
  const delta_mm = delta_m * 1000;
  const L_over_d = delta_m > 0 ? Math.round(L / delta_m) : '∞';

  // Span/deflection ratio check (common limits: L/300 general, L/500 precision machinery)
  let warning = '';
  if (typeof L_over_d === 'number') {
    if (L_over_d < 300)       warning = '⚠ L/δ < L/300 — excessive deflection for general structures.';
    else if (L_over_d < 500)  warning = '⚠ L/δ < L/500 — may be too flexible for precision machine frames. Consider deeper section.';
    else                      warning = `✓ L/δ = L/${L_over_d} — acceptable for precision machinery (typically L/500+).`;
  }

  // Bending stress (rectangular section assumption not possible without width/height)
  // Max bending moment at centre
  const M_max = (F * L) / 4;  // Nm
  const M_kNm = M_max / 1000;

  const html = resultGrid([
    { label: 'Max. Deflection', value: fmtNum(delta_mm, 3), unit: 'mm' },
    { label: 'Span / Deflection', value: 'L / ' + (typeof L_over_d === 'number' ? L_over_d : '∞'), unit: '' },
    { label: 'Max. Bending Moment', value: fmtNum(M_kNm, 3), unit: 'kNm' },
    { label: 'E × I (Flexural Rigidity)', value: fmtNum((E * I).toExponential(2)), unit: 'N·m²' },
  ]) + resultNote(
    `δ = F·L³ / (48·E·I) = ${F_kN}kN × ${L_mm}³mm / (48 × ${E_GPa}GPa × ${I_cm4}cm⁴)`,
    warning
  );

  showResult('res-beam', html);
}

/* ===========================
   CONTACT FORM → MAILTO
=========================== */
function sendEmail() {
  const name    = document.getElementById('f-name').value.trim();
  const company = document.getElementById('f-company').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const subject = document.getElementById('f-subject').value.trim();
  const msg     = document.getElementById('f-msg').value.trim();

  if (!name || !email || !msg) {
    alert('Please fill in at least your name, email address, and message.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const sub  = subject || 'Portfolio Enquiry — ' + name;
  const body =
    `Name: ${name}\n` +
    (company ? `Company: ${company}\n` : '') +
    `Email: ${email}\n\n` +
    `---\n\n${msg}`;

  window.location.href =
    `mailto:sunnypanchani9007@gmail.com` +
    `?subject=${encodeURIComponent(sub)}` +
    `&body=${encodeURIComponent(body)}`;
}

/* ===========================
   CALCULATOR TAB SWITCHING
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  const calcTabs   = document.querySelectorAll('.calc-tab');
  const calcPanels = document.querySelectorAll('.calc-panel');

  calcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.calc;

      calcTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      calcPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('calc-' + target);
      if (panel) panel.classList.add('active');
    });
  });
});
