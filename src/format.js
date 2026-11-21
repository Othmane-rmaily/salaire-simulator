// Formatage des montants (dépend de la langue, comme la version d'origine)
export function createFmt(lang){
  const dec = lang==='en' ? '.' : ',';
  function fmt(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ') + ' DH'; }
  function fmt2(n){
    const s = n.toFixed(2).replace('.', dec);
    const parts = s.split(dec); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ');
    return parts.join(dec) + ' DH';
  }
  function fmtSigne(n){ const r=Math.round(n); return (r>0?'+':'') + fmt(r); }
  function pct(x){ return (x*100).toFixed(1).replace('.', dec) + ' %'; }
  return { fmt, fmt2, fmtSigne, pct };
}
