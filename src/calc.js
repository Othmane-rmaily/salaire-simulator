// ================= MOTEUR DE CALCUL — méthode légale annuelle =================
// Porté à l'identique de la version HTML d'origine (validée au centime).
export const BAREMES = {
  2026: [[40000,0],[60000,0.10],[80000,0.20],[100000,0.30],[180000,0.34],[Infinity,0.37]],
  2027: [[60000,0],[80000,0.10],[100000,0.20],[180000,0.34],[Infinity,0.37]],
  2028: [[60000,0],[100000,0.10],[200000,0.25],[Infinity,0.37]],
  2029: [[60000,0],[130000,0.10],[200000,0.20],[Infinity,0.35]],
  2030: [[60000,0],[150000,0.10],[200000,0.20],[Infinity,0.30]],
  2031: [[60000,0],[150000,0.10],[500000,0.20],[Infinity,0.30]],
};
export const YEARS = [2026,2027,2028,2029,2030,2031];
export const PLAFOND_CNSS = 6000, TAUX_CNSS = 0.0448, TAUX_AMO = 0.0226;
export const PLAFOND_FRAIS_A = 35000, SEUIL_FRAIS_A = 78000, RED_FAMILLE_A = 600;
export const LAW_URL = 'https://www.finances.gov.ma/Publication/db/2027/corps-PLF2027-fr.pdf';

export function calc(brutImp, year, deps, indemn, cimr){
  const indemnImposable = (year >= 2031) ? indemn : 0;
  const indemnExo = indemn - indemnImposable;
  const sbi = brutImp + indemnImposable;
  const brutGlobal = brutImp + indemn;
  const cnss = Math.min(sbi, PLAFOND_CNSS) * TAUX_CNSS;
  const amo  = sbi * TAUX_AMO;
  const cotis = cnss + amo;
  const sbiA = sbi * 12;
  let fraisRate;
  if(year === 2026) fraisRate = (sbiA <= SEUIL_FRAIS_A) ? 0.35 : 0.25;
  else fraisRate = 0.45;
  const fraisA = Math.min(sbiA * fraisRate, PLAFOND_FRAIS_A);
  const fraisPlafonne = (sbiA * fraisRate) > PLAFOND_FRAIS_A;
  const baseAvantCimrA = Math.max(sbiA - cotis*12 - fraisA, 0);
  const cimrDedA = Math.min(cimr*12, 0.5 * baseAvantCimrA);
  const rniA = Math.max(baseAvantCimrA - cimrDedA, 0);
  const rniM = rniA / 12;
  const bareme = BAREMES[year];
  let prev = 0, irA = 0; const tranches = [];
  for(const [capA, rate] of bareme){
    const part = Math.max(Math.min(rniA, capA) - prev, 0);
    tranches.push({fromA:prev, toA:capA, partA:part, rate, taxA:part*rate});
    irA += part * rate;
    prev = capA;
    if(!isFinite(capA)) break;
  }
  let tauxMarginal = 0, sommeDedA = 0;
  { let p=0; for(const [capA, rate] of bareme){ if(rniA > p){ tauxMarginal = rate; sommeDedA = rniA*rate - irA; } p = capA; if(rniA <= capA) break; } }
  const redFamA = Math.min(deps,6) * RED_FAMILLE_A;
  const irPayeA = Math.max(irA - redFamA, 0);
  const net = brutGlobal - cotis - cimr - irPayeA/12;
  const patCNSS = Math.min(sbi, PLAFOND_CNSS) * 0.0898;
  const patAlloc = sbi * 0.064;
  const patAMO = sbi * 0.0411;
  const patTFP = sbi * 0.016;
  const patTotal = patCNSS + patAlloc + patAMO + patTFP;
  return { year, brutImp, indemn, indemnExo, indemnImposable, sbi, brutGlobal,
    cnss, amo, cotis, sbiA, fraisRate, fraisA, fraisPlafonne, cimr, cimrDedA,
    rniA, rniM, tranches, irA, tauxMarginal, sommeDedA, redFamA, irPayeA, net,
    patCNSS, patAlloc, patAMO, patTFP, patTotal, coutEmployeur: brutGlobal + patTotal };
}

export function brutFromNet(targetNet, year, deps, indemn, cimr){
  let lo = Math.max(targetNet - indemn, 0), hi = targetNet*1.8 + 5000;
  while(calc(hi, year, deps, indemn, cimr).net < targetNet && hi < 2000000) hi *= 1.5;
  for(let i=0;i<80;i++){ const mid=(lo+hi)/2; (calc(mid, year, deps, indemn, cimr).net < targetNet) ? lo=mid : hi=mid; }
  return (lo+hi)/2;
}

export function bulletinRows(c, deps, t){
  const rows = [];
  rows.push([t.bGross, c.brutGlobal, '']);
  if(c.indemn > 0) rows.push([c.indemnExo > 0 ? t.bIndemnExo : t.bIndemn2031, c.indemn, 'info']);
  rows.push([t.bSbi, c.sbi, '']);
  rows.push([t.bCnss, -c.cnss, '']);
  rows.push([t.bAmo, -c.amo, '']);
  rows.push([t.bFrais(Math.round(c.fraisRate*100), c.fraisPlafonne), -c.fraisA/12, 'info']);
  if(c.cimr > 0) rows.push([t.bCimrDed, -c.cimrDedA/12, 'info']);
  rows.push([t.bRni, c.rniM, 'hl']);
  rows.push([t.bIrScale(c.year), -c.irA/12, '']);
  rows.push([t.bFam(Math.min(deps,6)), c.redFamA/12, 'info']);
  rows.push([t.bIrPaid, c.irPayeA/12, '']);
  if(c.cimr > 0) rows.push([t.bCimr, -c.cimr, '']);
  rows.push([t.bNet, c.net, 'total']);
  return rows;
}

export function sommeDeduit(year, i){
  const b = BAREMES[year]; let ded = 0;
  for(let k=1;k<=i;k++){ ded += (b[k][1]-b[k-1][1]) * b[k-1][0]; }
  return ded;
}
