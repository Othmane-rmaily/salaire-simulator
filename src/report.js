import { BAREMES, YEARS, calc, bulletinRows } from './calc.js';

// ================= RAPPORT COMPLET (PDF via impression) — porté de l'original =================
export function buildReportHTML({ t, F, brut, year, deps, indemn, cimr, lang }){
  const { fmt, fmt2, fmtSigne, pct } = F;
  const c = calc(brut, year, deps, indemn, cimr);
  const allYears = YEARS.map(y=>calc(brut, y, deps, indemn, cimr));
  const c2026 = allYears[0];
  const date = new Date().toLocaleDateString(lang==='fr' ? 'fr-FR' : 'en-GB', {day:'numeric', month:'long', year:'numeric'});
  const rowsBulletin = bulletinRows(c, deps, t).map(r=>'<tr><td>'+r[0]+'</td><td style="text-align:right">'+fmt2(r[1])+'</td><td style="text-align:right">'+fmt2(r[1]*12)+'</td></tr>').join('');
  const rowsTranches = c.tranches.map(tr=>'<tr><td>'+t.from+' '+fmt(tr.fromA)+' '+t.to+' '+(isFinite(tr.toA)?fmt(tr.toA):'∞')+'</td><td style="text-align:right">'+fmt2(tr.partA)+'</td><td style="text-align:right">'+Math.round(tr.rate*100)+' %</td><td style="text-align:right">'+fmt2(tr.taxA)+'</td></tr>').join('');
  const rowsYears = allYears.map(cc=>'<tr><td>'+cc.year+'</td><td style="text-align:right">'+fmt2(cc.net)+'</td><td style="text-align:right">'+fmt2(cc.irPayeA/12)+'</td><td style="text-align:right">'+fmt2(cc.rniM)+'</td><td style="text-align:right">'+(cc.year===2026?'—':fmtSigne(cc.net-c2026.net))+'</td></tr>').join('');
  const rowsBaremes = YEARS.map(y=>{
    let prevA=0;
    const cells = BAREMES[y].map(([cap,rate])=>{ const l = !isFinite(cap)?'&gt; '+fmt(prevA) : fmt(prevA)+' – '+fmt(cap); prevA=cap; return l+' : '+Math.round(rate*100)+' %'; }).join('<br>');
    return '<tr><td>'+y+'</td><td>'+cells+'</td></tr>';
  }).join('');
  return '' +
    '<h1>' + t.repTitle + '</h1>' +
    '<p class="small">' + t.repSub(date, year) + '<b>' + year + '</b></p>' +
    '<h2>' + t.repData + '</h2><table>' +
    '<tr><td>' + t.repBrutImp + '</td><td style="text-align:right">'+fmt2(c.brutImp)+'</td></tr>' +
    '<tr><td>' + t.repIndemn + '</td><td style="text-align:right">'+fmt2(c.indemn)+'</td></tr>' +
    '<tr><td>' + t.repCimr + '</td><td style="text-align:right">'+fmt2(c.cimr)+'</td></tr>' +
    '<tr><td>' + t.repDeps + '</td><td style="text-align:right">'+deps+'</td></tr></table>' +
    '<h2>' + t.repResult + ' ' + year + '</h2><p>' + t.repNetM + ' : <span class="big">'+fmt2(c.net)+'</span> &nbsp;·&nbsp; ' + t.repNetA + ' : '+fmt2(c.net*12)+' &nbsp;·&nbsp; ' + t.repGain + ' : '+fmtSigne(c.net-c2026.net)+' ' + t.perMonth + '</p>' +
    '<h2>' + t.repPayslip + ' — ' + year + '</h2><table><tr><th>' + t.thStep + '</th><th style="text-align:right">' + t.thMonth + '</th><th style="text-align:right">' + t.thYear + '</th></tr>' + rowsBulletin + '</table>' +
    '<h2>' + t.repTranches + ' — ' + year + '</h2><table><tr><th>' + t.repTranche + '</th><th style="text-align:right">' + t.thYourPart + '</th><th style="text-align:right">' + t.thRate + '</th><th style="text-align:right">' + t.thTax + '</th></tr>' + rowsTranches + '</table>' +
    '<p class="small">' + t.repMarginal(Math.round(c.tauxMarginal*100), fmt2(c.sommeDedA), (c.brutGlobal>0?pct(c.irPayeA/12/c.brutGlobal):'0 %')) + '</p>' +
    '<h2>' + t.repYears + '</h2><table><tr><th>' + t.repYear + '</th><th style="text-align:right">' + t.repNetM + '</th><th style="text-align:right">' + t.repIrM + '</th><th style="text-align:right">' + t.repRniM + '</th><th style="text-align:right">' + t.repGain + '</th></tr>' + rowsYears + '</table>' +
    '<h2>' + t.repEmployer + ' — ' + year + '</h2><table>' +
    '<tr><td>' + t.repPat + '</td><td style="text-align:right">'+fmt2(c.patTotal)+' ' + t.perMonth + '</td></tr>' +
    '<tr><td>' + t.repCost + '</td><td style="text-align:right">'+fmt2(c.coutEmployeur)+' ' + t.perMonth + '</td></tr></table>' +
    '<h2>' + t.repBaremes + '</h2><table><tr><th>' + t.repYear + '</th><th>' + t.repScale + '</th></tr>' + rowsBaremes + '</table>' +
    '<h2>' + t.repMethod + '</h2><p class="small">' + t.repMethodTxt + '</p>';
}
