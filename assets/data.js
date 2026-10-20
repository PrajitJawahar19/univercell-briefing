/* ===========================================================================
   Every figure used in the deck, in one place.

   All money is shown in rupees. Foreign figures are converted at a single
   fixed rate so that trends stay comparable across years:

       USD 1 = INR 95.24      EUR 1 = INR 106.82      GBP 1 = INR 123.00
       (Reserve-rate basis, 19 October 2026)

   Using one rate for the whole series means older years are stated in
   today's rupees. That is deliberate: it keeps the shape of the trend
   honest. The original currency is kept alongside every figure so nothing
   is lost, and a reader can always check the arithmetic.
   =========================================================================== */

const FX = { USD: 95.24, EUR: 106.82, GBP: 123.00 };

/** Convert to rupees. */
const inr = (v, cur = 'USD') => v * FX[cur];

/** Format a rupee amount the way an Indian reader expects. */
function cr(value, cur = 'USD') {         // -> "₹38,900 crore" / "₹1.6 lakh crore"
  const rupees = inr(value, cur);
  const crore = rupees / 1e7;
  if (crore >= 100000) return '₹' + (crore / 100000).toFixed(1) + ' lakh crore';
  if (crore >= 1000)  return '₹' + (Math.round(crore / 100) * 100).toLocaleString('en-IN') + ' crore';
  return '₹' + Math.round(crore).toLocaleString('en-IN') + ' crore';
}

const DATA = {
  fx: FX,
  fxNote: 'Converted at ₹95.24 to the US dollar and ₹106.82 to the euro, the rate on 19 October 2026, ' +
          'held constant across all years so the trend is comparable.',

  /* --- slide 3: what a battery costs, per kWh, in rupees ---------------- */
  packPrice: {   // BloombergNEF annual survey, USD/kWh -> INR thousand/kWh
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    usd:   [140,  132,  151,  139,  115,  108,  105],
    get inrK() { return this.usd.map(v => +(v * FX.USD / 1000).toFixed(1)); },
    storagePack2025: 70,      // USD/kWh
    cheapestLfpCell: 36,      // USD/kWh
    chinaPack2025: 84         // USD/kWh
  },

  /* --- slide 3: how much battery the world uses ------------------------- */
  demandGWh: {
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    ev:    [170,  340,  550,  750,  950,  1200],
    outlook2030: 3000,
    allLiIon2025TWh: 1.59,
    growth2025Pct: 29,
    bessGrowthPct: 51,
    evGrowthPct: 26,
    utilisationPct: 40,
    catlUtilisationPct: 96.9
  },

  /* --- slide 4: China's share of each step ------------------------------ */
  chinaShare: [
    { label: 'Anode material',         value: 98, note: 'and 98% of graphitisation' },
    { label: 'Battery-grade graphite', value: 94, note: 'still about 80% in 2035 on IEA projections' },
    { label: 'Cathode material',       value: 90 },
    { label: 'Cell manufacturing',     value: 85, note: 'over 80% of everything made in 2025' },
    { label: 'Cobalt refining',        value: 76 },
    { label: 'Lithium refining',       value: 74 },
    { label: 'Nickel refining',        value: 31 },
    { label: 'Lithium mining',         value: 16, note: 'the one step China does not hold' }
  ],

  /* --- slide 5: who buys, who sells ------------------------------------- */
  importers: [                                     // USD bn, 12 months to end-2025
    { label: 'Germany',       usd: 28.2, note: 'up 16%, and it passed the United States in May 2025' },
    { label: 'United States', usd: 22.2, note: 'flat, and China now supplies only 46% of it' },
    { label: 'Australia',     usd: 5.2,  note: 'up 43%' },
    { label: 'Czechia',       usd: 4.6,  note: 'up 24%' },
    { label: 'Mexico',        usd: 4.3,  note: 'down 24%' }
  ],
  chinaExports: { totalUsd: 76.8, growthPct: 26, euUsd: 31.0, usUsd: 11.9,
                  worldImportSharePct: 66.1, worldTonnageSharePct: 78.2,
                  indiaGrowthPct: 73, euH1_2026Eur: 16.4 },

  /* --- slide 6: what Europe promised against what it will build --------- */
  europe2030: [
    { label: 'Announced',       low: null, high: 2000, note: 'what Europe said it would build' },
    { label: 'Likely built',    low: 1200, high: 1700, note: 'Fraunhofer: 54 to 75% of announcements get realised' },
    { label: 'Actually made',   low: 800,  high: 1100, note: 'after delays, scrap and real utilisation' },
    { label: 'Europe needs',    low: 800,  high: 1300, note: 'demand and realistic output broadly meet' }
  ],
  europeMisc: { cancelledGWh: 700, germanyCancelledGWh: 240, asianControlledPct: 98,
                globalFactorySharePct: 13, deloitteForgoneEur: 10.5 },

  /* --- slide 7: the casualty list --------------------------------------- */
  failures: [
    { co: 'Northvolt',    country: 'Sweden',  what: 'Bankrupt Mar 2025. Shipped about 1 GWh against a 16 GWh target', amt: 15,    cur: 'USD' },
    { co: 'Varta',        country: 'Germany', what: 'Rescued in 2024, then filed insolvency again in Jul 2026',        amt: 0.285, cur: 'EUR' },
    { co: 'Morrow',       country: 'Norway',  what: 'Bankrupt May 2026, weeks after starting commercial production',   amt: 0.430, cur: 'EUR' },
    { co: 'CustomCells',  country: 'Germany', what: 'Insolvent 2025 when its one big customer did not pay',            amt: null,  cur: null },
    { co: 'Britishvolt',  country: 'UK',      what: 'Administration Jan 2023. The 30 GWh plant was never built',       amt: 4,     cur: 'GBP' },
    { co: 'Leclanché DE', country: 'Germany', what: 'German units filed insolvency in Sep 2026',                        amt: null,  cur: null },
    { co: 'Cellforce',    country: 'Germany', what: "Porsche's cell venture, closed completely in May 2026",            amt: null,  cur: null },
    { co: 'ACC',          country: 'France',  what: 'Two German and Italian plants cancelled, replaced by a CATL deal', amt: null,  cur: null }
  ],
  capitalDestroyedUsd: 17,   // bn, conservative floor across four named companies

  /* --- slides 8 and 9: the company -------------------------------------- */
  company: {
    people: 92, registered: 'May 2019', seriesBEur: 30, seriesBDate: '4 March 2026',
    eicGrantEur: 2.39, balanceSheetEur: 12.35, shareCapitalEur: 403528,
    sodiumProjectEur: 14.5, patents: 1, recipes: 1000,
    cellAh: 6.0, cellWh: 21.6, cellWhPerKg: 330, cellC: 6, cellCycles: 750
  },
  arithmetic: {
    marketedMWh: 1500, plan2027MWh: 1300, seriesBTargetMWh: 864, actualMWh: 13,
    cellsPerMonth: 50000, utilisationPct: 0.86, gapTimes: 116,
    cellsNeededPerMonth: 5800000, smallerThanArnstadt: 7.5, smallerThanSalzgitter: 27
  },

  /* --- slide 10: dry coating -------------------------------------------- */
  dryCoating: {
    energySavingPct: 27, costCutLowPct: 17, costCutHighPct: 30,
    ranking: [
      { n: 1, who: 'Tesla',           scope: 'Both electrodes, fully dry',   scale: 'Mass production in Texas' },
      { n: 2, who: 'VW PowerCo',      scope: 'Both electrodes',              scale: 'Factory built, series use unconfirmed' },
      { n: 3, who: 'UniverCell',      scope: 'Both electrodes, in-house',    scale: 'Running, but under one GWh', me: true },
      { n: 5, who: 'AM Batteries',    scope: 'Sells dry electrodes',         scale: 'Pilot, US plant funded' },
      { n: 6, who: 'LG Energy',       scope: 'Full electrode',               scale: 'Pilot done, production in 2028' },
      { n: 8, who: 'Dürr and LiCAP',  scope: 'Equipment and know-how',       scale: 'Proven, but lost its pilot site' }
    ],
    molicelTheirs: 330, molicelRival: 284, molicelGramsOfHousing: 12, molicelEnergyDeficitPct: 2.4
  },

  /* --- slide 11: where the money sits ----------------------------------- */
  valueChain: [
    { label: 'Digging and refining', value: 55, color: 'var(--s2)' },
    { label: 'Electrodes and cells', value: 22, color: 'var(--s1)' },
    { label: 'Packs',                value: 13, color: 'var(--alu)'  },
    { label: 'Systems and recycling', value: 10, color: 'var(--s4)' }
  ],

  /* --- slide 12: Porter --------------------------------------------------*/
  forces: {
    names:     ['Suppliers', 'Rivals', 'Substitutes', 'New entrants', 'Buyers'],
    niche:     [4, 3, 3, 2, 2],
    commodity: [4, 5, 3, 4, 5],
    nicheAvg: 2.8, commodityAvg: 4.2,
    eveCellsPerYear: 680   // million 21700 cells from one Malaysian plant
  },

  /* --- slide 15: India ---------------------------------------------------*/
  indiaImports: {                                   // HS 850760
    labels: ['FY19', 'FY23', 'CY24', 'CY25', 'to Apr 26'],
    usd:    [0.3846, 2.8, 2.8389, 4.0836, 4.6279],  // bn
    get crore() { return this.usd.map(v => Math.round(v * 1e9 * FX.USD / 1e7)); },
    chinaSharePct: 93.3, valueGrowthPct: 43.9, volumeGrowthPct: 75.1,
    fy30LowUsd: 14, fy30HighUsd: 23
  },
  indiaPli: { targetGWh: 50, awardedGWh: 40, builtGWh: 1.4, builtPct: 2.8,
              actualQ3MWh: 1.9, outlayCrore: 18100, disbursedCrore: 0,
              dutyFreeMachines: 85, dutyFreeUntil: '31 March 2029' },
  indiaDemand: { y2025GWh: 28, low2030GWh: 115, high2030GWh: 272 }
};

/* Convenience strings used on more than one slide, built once. */
DATA.str = {
  packPriceINR:   '₹' + Math.round(DATA.packPrice.usd[5] * FX.USD).toLocaleString('en-IN'),
  storageINR:     '₹' + Math.round(DATA.packPrice.storagePack2025 * FX.USD).toLocaleString('en-IN'),
  cheapCellINR:   '₹' + Math.round(DATA.packPrice.cheapestLfpCell * FX.USD).toLocaleString('en-IN'),
  destroyed:      cr(DATA.capitalDestroyedUsd * 1e9, 'USD'),
  seriesB:        cr(DATA.company.seriesBEur * 1e6, 'EUR'),
  indiaBill:      cr(DATA.indiaImports.usd[3] * 1e9, 'USD'),
  indiaFy30Low:   cr(DATA.indiaImports.fy30LowUsd * 1e9, 'USD'),
  indiaFy30High:  cr(DATA.indiaImports.fy30HighUsd * 1e9, 'USD'),
  chinaExports:   cr(DATA.chinaExports.totalUsd * 1e9, 'USD')
};
