import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BAREMES, YEARS, LAW_URL, calc, brutFromNet, bulletinRows, sommeDeduit } from './calc.js';
import { S } from './i18n.js';
import { createFmt } from './format.js';
import { buildReportHTML } from './report.js';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.45, ease: 'easeOut' },
};
const html = (s) => ({ dangerouslySetInnerHTML: { __html: s } });

export default function App(){
  const [lang, setLang] = useState(() => localStorage.getItem('salaire-lang') || 'fr');
  const [theme, setTheme] = useState(() => localStorage.getItem('salaire-theme') || 'light');
  const [mode, setMode] = useState('brut');
  const [amount, setAmount] = useState(12000);
  const [year, setYear] = useState(2027);
  const [deps, setDeps] = useState(0);
  const [indemn, setIndemn] = useState(0);
  const [cimr, setCimr] = useState(0);
  const [reportHTML, setReportHTML] = useState('');

  const t = S[lang];
  const F = useMemo(() => createFmt(lang), [lang]);
  const { fmt, fmt2, fmtSigne, pct } = F;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('salaire-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('salaire-lang', lang);
    document.title = lang === 'fr'
      ? 'Simulateur de salaire 2027 — Maroc | Calcul complet selon le PLF 2027'
      : 'Salary Simulator 2027 — Morocco | Full calculation under the 2027 Finance Bill';
  }, [lang]);

  const brut = useMemo(
    () => (mode === 'brut' ? amount : brutFromNet(amount, year, deps, indemn, cimr)),
    [mode, amount, year, deps, indemn, cimr]
  );
  const c = useMemo(() => calc(brut, year, deps, indemn, cimr), [brut, year, deps, indemn, cimr]);
  const c2026 = useMemo(() => calc(brut, 2026, deps, indemn, cimr), [brut, deps, indemn, cimr]);
  const gain = c.net - c2026.net;

  const rows = bulletinRows(c, deps, t);
  const rows2026 = bulletinRows(c2026, deps, t);
  const compareN = Math.min(rows.length, rows2026.length);

  const nets = YEARS.map(y => ({ y, net: calc(brut, y, deps, indemn, cimr).net }));
  const maxNet = Math.max(...nets.map(n => n.net), 1);

  let totPart = 0, totTax = 0;
  c.tranches.forEach(tr => { totPart += tr.partA; totTax += tr.taxA; });

  const employerRows = [
    [t.eCnss, c.patCNSS], [t.eAlloc, c.patAlloc], [t.eAmo, c.patAMO],
    [t.eTfp, c.patTFP], [t.eTotal, c.patTotal], [t.eCost, c.coutEmployeur],
  ];

  let prevBareme = 0;
  const baremeRows = BAREMES[year].map(([cap, rate], i) => {
    const label = !isFinite(cap)
      ? t.above + ' ' + fmt(prevBareme)
      : (prevBareme === 0 ? t.from + ' 0 ' + t.to + ' ' + fmt(cap) : t.from + ' ' + fmt(prevBareme + 1) + ' ' + t.to + ' ' + fmt(cap));
    prevBareme = cap;
    return { label, rate, ded: sommeDeduit(year, i) };
  });

  const waHref = 'https://wa.me/?text=' + encodeURIComponent(
    t.waText(fmt(c.brutGlobal), fmt(c.net), year, fmtSigne(gain)) + (typeof location !== 'undefined' ? location.href : '')
  );

  const downloadReport = () => {
    setReportHTML(buildReportHTML({ t, F, brut, year, deps, indemn, cimr, lang }));
    setTimeout(() => window.print(), 150);
  };

  const sliderVal = Math.min(Math.max(amount, 3000), 50000);

  return (
    <>
    <div className="wrap">

      <div className="topbar">
        <a className="topbtn law" href={LAW_URL} target="_blank" rel="noopener">{t.lawLink}</a>
        <motion.button whileTap={{ scale: 0.94 }} className="topbtn" type="button" aria-label="Language / Langue"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>{lang === 'fr' ? 'EN' : 'FR'}</motion.button>
        <motion.button whileTap={{ scale: 0.94 }} className="topbtn" type="button" aria-label="Dark / Light"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</motion.button>
      </div>

      <motion.button {...fadeUp} whileTap={{ scale: 0.98 }} className="dlbtn top" type="button" onClick={downloadReport}>{t.dlBtn}</motion.button>

      <motion.section {...fadeUp} className="hero">
        <p className="kicker">{t.heroKicker}</p>
        <h1 {...html(t.heroTitle)} />
        <p {...html(t.heroSub)} />
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.hYourSalary}</h2>
        <label className="lbl">{t.lblSalary}</label>
        <div className="seg" role="tablist" aria-label="Brut ou net">
          <button className={mode === 'brut' ? 'on' : ''} type="button" onClick={() => setMode('brut')}>{t.brut}</button>
          <button className={mode === 'net' ? 'on' : ''} type="button" onClick={() => setMode('net')}>{t.net}</button>
        </div>
        <div className="amount">
          <input type="number" inputMode="decimal" min="0" max="200000" value={amount}
            aria-label="Montant mensuel en dirhams"
            onChange={e => setAmount(Math.max(0, +e.target.value || 0))} />
          <span>DH</span>
        </div>
        <input type="range" min="3000" max="50000" step="100" value={sliderVal} aria-label="Curseur salaire"
          onChange={e => setAmount(+e.target.value)} />
        <p className="help">{mode === 'brut' ? t.modeHelpBrut : t.modeHelpNet}</p>

        <label className="lbl">{t.lblYear}</label>
        <div className="years">
          {YEARS.map(y => (
            <motion.button whileTap={{ scale: 0.94 }} key={y} type="button"
              className={y === year ? 'on' : ''} onClick={() => setYear(y)}>{y}</motion.button>
          ))}
        </div>

        <label className="lbl">{t.lblDeps}</label>
        <div className="stepper">
          <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Moins" onClick={() => setDeps(Math.max(0, deps - 1))}>−</motion.button>
          <span className="val">{deps}</span>
          <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Plus" onClick={() => setDeps(Math.min(6, deps + 1))}>+</motion.button>
        </div>
        <p className="help">{t.depsHelp}</p>

        <label className="lbl">{t.lblOptions}</label>
        <div className="opt">
          <div>
            <div className="fld"><input type="number" inputMode="decimal" min="0" value={indemn}
              aria-label="Indemnités exonérées par mois"
              onChange={e => setIndemn(Math.max(0, +e.target.value || 0))} /><span>DH</span></div>
            <p className="help">{t.indemnHelp}</p>
          </div>
          <div>
            <div className="fld"><input type="number" inputMode="decimal" min="0" value={cimr}
              aria-label="Retraite complémentaire par mois"
              onChange={e => setCimr(Math.max(0, +e.target.value || 0))} /><span>DH</span></div>
            <p className="help">{t.cimrHelp}</p>
          </div>
        </div>

        <div className="warn" {...html(t.warnBox)} />
      </motion.section>

      <motion.section {...fadeUp} className="netcard">
        <div className="t">{t.netMonthly} – {year}</div>
        <motion.div className="big" key={fmt2(c.net)}
          initial={{ scale: 0.96, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}>{fmt2(c.net)}</motion.div>
        <div className="yr">{fmt2(c.net * 12)} {t.perYear}</div>
      </motion.section>

      <div className="grid">
        <motion.div {...fadeUp} className="mini"><div className="t">{t.gainT}</div><div className="v pos">{year === 2026 ? '0 DH' : fmtSigne(gain)}</div><div className="s">{(year === 2026 ? '0 DH ' + t.perYear : fmtSigne(gain * 12) + ' ' + t.perYear) + ' – ' + t.inYear + ' 2026 : ' + fmt(c2026.net)}</div></motion.div>
        <motion.div {...fadeUp} className="mini"><div className="t">{t.irT}</div><div className="v">{fmt2(c.irPayeA / 12)}</div><div className="s">{t.irReal + ' ' + (c.brutGlobal > 0 ? pct(c.irPayeA / 12 / c.brutGlobal) : '0') + ' ' + t.ofGross + ' · ' + t.marginal + ' ' + Math.round(c.tauxMarginal * 100) + ' % – ' + t.inYear + ' 2026 : ' + fmt(c2026.irPayeA / 12)}</div></motion.div>
        <motion.div {...fadeUp} className="mini"><div className="t">{t.brutT}</div><div className="v">{fmt(c.brutGlobal)}</div><div className="s">{mode === 'net' ? t.fromNet : t.onContract + (c.indemn > 0 ? ' (' + t.inclIndemn + ' ' + fmt(c.indemn) + ')' : '')}</div></motion.div>
        <motion.div {...fadeUp} className="mini"><div className="t">{t.cotT}</div><div className="v">{fmt2(c.cotis)}</div><div className="s">{'CNSS ' + fmt2(c.cnss) + ' · AMO ' + fmt2(c.amo) + t.cotDetail}</div></motion.div>
      </div>

      <motion.section {...fadeUp} className="card">
        <h2>{t.payslip} – {year}</h2>
        <table>
          <thead><tr><th>{t.thStep}</th><th className="num">{t.thMonth}</th><th className="num">{t.thYear}</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r[2] || undefined}>
                <td><span className="rowlabel"><span className="step">{i + 1}</span><span>{r[0]}</span></span></td>
                <td className="num">{fmt2(r[1])}</td><td className="num">{fmt2(r[1] * 12)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note" {...html(t.bulletinNote)} />
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.hTranches}</h2>
        <table>
          <thead><tr><th>{t.thTranche}</th><th className="num">{t.thYourPart}</th><th className="num">{t.thRate}</th><th className="num">{t.thTax}</th></tr></thead>
          <tbody>
            {c.tranches.map((tr, i) => (
              <tr key={i}>
                <td>{t.from} {tr.fromA === 0 ? '0' : fmt(tr.fromA / 12).replace(' DH', '')} {t.to} {isFinite(tr.toA) ? fmt(tr.toA / 12).replace(' DH', '') : '∞'}</td>
                <td className="num">{fmt2(tr.partA / 12)}</td>
                <td className="num">{Math.round(tr.rate * 100)} %</td>
                <td className="num">{fmt2(tr.taxA / 12)}</td>
              </tr>
            ))}
            <tr className="total"><td>{t.totalIr}</td><td className="num">{fmt2(totPart / 12)}</td><td></td><td className="num">{fmt2(totTax / 12)}</td></tr>
          </tbody>
        </table>
        <p className="note" {...html(t.marginalNote(Math.round(c.tauxMarginal * 100), fmt2(c.sommeDedA), (c.brutGlobal > 0 ? pct(c.irPayeA / 12 / c.brutGlobal) : '0 %')))} />
      </motion.section>

      {year !== 2026 && (
        <motion.section {...fadeUp} className="card">
          <h2>{t.compare} 2026 / {year}</h2>
          <table>
            <thead><tr><th>{t.thStep}</th><th className="num">2026</th><th className="num">{year}</th></tr></thead>
            <tbody>
              {Array.from({ length: compareN }, (_, i) => (
                <tr key={i}>
                  <td><span className="rowlabel"><span className="step">{i + 1}</span><span>{rows2026[i][0].split(' (')[0]}</span></span></td>
                  <td className="num">{fmt2(rows2026[i][1])}</td>
                  <td className="num">{fmt2(rows[i][1])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>
      )}

      <motion.section {...fadeUp} className="card">
        <h2>{t.chartTitle}</h2>
        <div className="chart">
          {nets.map(n => {
            const h = Math.max(n.net / maxNet * 100, 4);
            const d = n.net - nets[0].net;
            return (
              <div className="barcol" key={n.y}>
                <motion.div className={'bar' + (n.y === 2026 ? ' base' : '')}
                  initial={{ height: '0%' }} animate={{ height: h + '%' }}
                  transition={{ type: 'spring', stiffness: 90, damping: 20 }}>
                  <span className="bv">{fmt(n.net).replace(' DH', '')}</span>
                </motion.div>
                <div className="by">{n.y}</div>
                <div className="bd">{n.y === 2026 ? '—' : fmtSigne(d)}</div>
              </div>
            );
          })}
        </div>
        <p className="note" {...html(t.chartNote)} />
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.hEmployer}</h2>
        <table><tbody>
          {employerRows.map((r, i) => (
            <tr key={i} className={i >= employerRows.length - 2 ? 'total' : undefined}>
              <td>{r[0]}</td><td className="num">{fmt2(r[1])}</td>
            </tr>
          ))}
        </tbody></table>
        <p className="note" {...html(t.employerNote)} />
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.bareme} {year}</h2>
        <table>
          <thead><tr><th>{t.thRni}</th><th className="num">{t.thRate}</th><th className="num">{t.thDed}</th></tr></thead>
          <tbody>
            {baremeRows.map((r, i) => (
              <tr key={i}><td>{r.label}</td><td className="num">{Math.round(r.rate * 100)} %</td><td className="num">{fmt2(r.ded)}</td></tr>
            ))}
          </tbody>
        </table>
      </motion.section>

      <motion.section {...fadeUp} className="cta">
        <h2>{t.ctaTitle(fmt(c.net))}</h2>
        <p {...html(t.ctaP)} />
        <div className="budget">
          <div><span {...html(t.budL1)} /><b>{fmt(c.net * 0.5)}</b></div>
          <div><span {...html(t.budL2)} /><b>{fmt(c.net * 0.3)}</b></div>
          <div><span {...html(t.budL3)} /><b>{fmt(c.net * 0.2)}</b></div>
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.hHyp}</h2>
        <ul className="hyp">
          {t.hyp.map((h, i) => <li key={i} {...html(h)} />)}
        </ul>
      </motion.section>

      <motion.section {...fadeUp} className="card">
        <h2>{t.hReport}</h2>
        <p className="note" style={{ margin: '0 0 14px' }} {...html(t.reportP)} />
        <motion.button whileTap={{ scale: 0.98 }} className="dlbtn" type="button" onClick={downloadReport}>{t.dlBtn}</motion.button>
        <p className="help" {...html(t.dlHelp)} />
      </motion.section>

      <footer {...html(t.footer)} />
    </div>

    <div id="report" aria-hidden="true" {...html(reportHTML)} />

    <a className="wa" href={waHref} target="_blank" rel="noopener" aria-label="Partager mon résultat sur WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .7-.2 1.2z"/></svg>
    </a>
    </>
  );
}
