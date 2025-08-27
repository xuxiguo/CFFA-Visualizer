import React, { useMemo, useState, useEffect } from "react";

// ---------- Utilities ----------
const num = (v: any) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt0 = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

// Colors / legend
const C = {
  revenue: "#0284c7",
  cogs: "#2563eb",
  dep: "#10b981",
  ebit: "#16a34a",
  interest: "#f97316",
  tax: "#ef4444",
  netIncome: "#0d9488",
  retained: "#0ea5e9",
  dividend: "#22c55e",
  ocf: "#06b6d4",
  ncs: "#f59e0b",
  dnwc: "#3b82f6",
  cffa: "#8b5cf6",
  cred: "#dc2626",
  eq: "#22c55e",
  arterial: "#e11d48",
  venous: "#0ea5e9",
};

// Example preset (matches the textbook numbers)
const PRESET = {
  revenue: 1509,
  cogs: 750,
  depreciation: 65,
  interestPaid: 70,
  taxes: 212,
  dividends: 103,
  begNetPPE: 1644,
  endNetPPE: 1709,
  begCA: 1112,
  endCA: 1403,
  begCL: 428,
  endCL: 389,
  begLTD: 408,
  endLTD: 454,
  begCSAPIC: 600,
  endCSAPIC: 640,
};

// Steps for the flow animation
const STEP_ORDER = [
  "EBIT→OCF",
  "DEP→OCF",
  "TAX→OCF",
  "OCF→CFFA",
  "NCS→CFFA",
  "ΔNWC→CFFA",
  "CFFA→Creditors",
  "CFFA→Stockholders",
] as const;

type StepKey = typeof STEP_ORDER[number];

type ScenarioKey = "early" | "mature" | "distress";

export default function App() {
  const [values, setValues] = useState({ ...PRESET });
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [scenario, setScenario] = useState<ScenarioKey | "custom">("custom");

  useEffect(() => {
    if (!playing || showAll) return;
    const id = setInterval(() => setStepIndex((s) => (s < STEP_ORDER.length - 1 ? s + 1 : 0)), 1100);
    return () => clearInterval(id);
  }, [playing, showAll]);

  const update = (k: keyof typeof PRESET) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setScenario("custom");
    setValues((s) => ({ ...s, [k]: e.target.value } as any));
  };

  // Derived metrics
  const d = useMemo(() => {
    const Revenue = num(values.revenue);
    const COGS = num(values.cogs);
    const DEP = num(values.depreciation);
    const EBIT = Revenue - COGS - DEP; // simple EBIT per slide

    const Interest = num(values.interestPaid);
    const Tax = num(values.taxes);
    const Taxable = EBIT - Interest;
    const NetIncome = Taxable - Tax;
    const Dividends = num(values.dividends);
    const RetainedAdd = NetIncome - Dividends;

    const OCF = EBIT + DEP - Tax;

    const NCS = num(values.endNetPPE) - num(values.begNetPPE) + DEP;
    const begNWC = num(values.begCA) - num(values.begCL);
    const endNWC = num(values.endCA) - num(values.endCL);
    const dNWC = endNWC - begNWC;

    const CFFA = OCF - NCS - dNWC;

    const dLTD = num(values.endLTD) - num(values.begLTD);
    const CFtoCreditors = Interest - dLTD;
    const dEquity = num(values.endCSAPIC) - num(values.begCSAPIC);
    const CFtoStockholders = Dividends - dEquity;

    const gap = CFtoCreditors + CFtoStockholders - CFFA;

    return { Revenue, COGS, DEP, EBIT, Interest, Tax, Taxable, NetIncome, Dividends, RetainedAdd, OCF, NCS, dNWC, CFFA, CFtoCreditors, CFtoStockholders, gap } as const;
  }, [values]);

  // === Scenario generator ===
  function applyScenario(kind: ScenarioKey, randomized = false) {
    const r = (a: number, b: number) => (randomized ? a + Math.random() * (b - a) : (a + b) / 2);
    let v = { ...values };

    if (kind === "early") {
      const targetEBIT = Math.round(r(-50, 80));
      v.depreciation = Math.round(r(20, 120));
      v.revenue = Math.round(r(800, 1400));
      v.cogs = v.revenue - v.depreciation - targetEBIT; // make EBIT hit the target
      v.taxes = Math.max(0, Math.round(targetEBIT * 0.25));
      v.interestPaid = Math.round(r(10, 60));
      v.dividends = 0;
      v.begNetPPE = 1000; v.endNetPPE = Math.round(1100 + r(50, 250));
      v.begCA = 500; v.endCA = Math.round(650 + r(0, 150));
      v.begCL = 200; v.endCL = Math.round(220 + r(0, 120));
      v.begLTD = 300; v.begCSAPIC = 200;
    }
    if (kind === "mature") {
      const targetEBIT = Math.round(r(400, 1200));
      v.depreciation = Math.round(r(60, 160));
      v.revenue = Math.round(r(1800, 3200));
      v.cogs = v.revenue - v.depreciation - targetEBIT;
      v.taxes = Math.round(targetEBIT * 0.30);
      v.interestPaid = Math.round(r(30, 120));
      v.dividends = Math.round(r(50, 300));
      v.begNetPPE = 2000; v.endNetPPE = Math.round(2000 + r(-50, 120));
      v.begCA = 1500; v.endCA = Math.round(1500 + r(-40, 80));
      v.begCL = 800; v.endCL = Math.round(800 + r(-40, 60));
      v.begLTD = 1000; v.begCSAPIC = 800;
    }
    if (kind === "distress") {
      const targetEBIT = Math.round(r(-200, 150));
      v.depreciation = Math.round(r(40, 140));
      v.revenue = Math.round(r(900, 1700));
      v.cogs = v.revenue - v.depreciation - targetEBIT;
      v.taxes = Math.max(0, Math.round(targetEBIT * 0.20));
      v.interestPaid = Math.round(r(60, 180));
      v.dividends = 0;
      v.begNetPPE = 1800; v.endNetPPE = Math.round(1700 + r(-120, 60));
      v.begCA = 1200; v.endCA = Math.round(1000 + r(-140, 40));
      v.begCL = 700; v.endCL = Math.round(800 + r(0, 140));
      v.begLTD = 1200; v.begCSAPIC = 900;
    }

    // Choose investor split ratio and solve for ΔLTD / ΔEquity to keep identity = 0
    const EBIT = (v.revenue as number) - (v.cogs as number) - (v.depreciation as number);
    const OCF = EBIT + (v.depreciation as number) - (v.taxes as number);
    const NCS = (v.endNetPPE as number) - (v.begNetPPE as number) + (v.depreciation as number);
    const dNWC = (v.endCA as number - v.endCL as number) - (v.begCA as number - v.begCL as number);
    const CFFA = OCF - NCS - dNWC;

    const ratio = kind === "early" ? 0.4 : kind === "mature" ? 0.6 : 0.5;
    const CFcred = Math.round(CFFA * ratio);
    const CFstk = Math.round(CFFA - CFcred);

    // ΔLTD = Interest − CFcred  ;  ΔEquity = Dividends − CFstk
    const dLTD = (v.interestPaid as number) - CFcred; v.endLTD = (v.begLTD as number) + dLTD;
    const dEquity = (v.dividends as number) - CFstk; v.endCSAPIC = (v.begCSAPIC as number) + dEquity;

    setScenario(kind); setValues(v); setShowAll(false); setStepIndex(0); setPlaying(false);
  }

  // define once (fix duplicate declaration error)
  const activeStep: StepKey = STEP_ORDER[stepIndex];
  const highlight = (keys: StepKey[]) => (!showAll && keys.includes(activeStep)) ? { outline: "3px solid #22d3ee", outlineOffset: 2, borderRadius: 8 } : undefined;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-[1800px] 2xl:max-w-screen-2xl mx-auto">
        <header className="mb-4">
          <h1 className="text-3xl font-bold">Cash Flow Identity Visualizer</h1>
          <p className="text-slate-600 text-[15px]">Income Statement now starts from <strong>Revenue → COGS → Depreciation → EBIT → Interest → Taxes → Net Income → Dividends → Addition to Retained Earnings</strong>. Balance Sheet is two-column (Year 1 | Year 2) with Assets on top and Liabilities & Equity below.</p>
        </header>

        {/* Scenario controls */}
        <section className="bg-white shadow rounded-2xl p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Lifecycle presets:</span>
            <button className={`px-3 py-1 border rounded ${scenario==="early"?"bg-rose-50 border-rose-300":""}`} onClick={()=>applyScenario("early")}>Early</button>
            <button className={`px-3 py-1 border rounded ${scenario==="mature"?"bg-emerald-50 border-emerald-300":""}`} onClick={()=>applyScenario("mature")}>Mature</button>
            <button className={`px-3 py-1 border rounded ${scenario==="distress"?"bg-amber-50 border-amber-300":""}`} onClick={()=>applyScenario("distress")}>Distress</button>
            <button className="px-3 py-1 border rounded" onClick={()=>scenario!=="custom"?applyScenario(scenario as ScenarioKey,true):applyScenario("mature",true)}>Randomize</button>
            <span className={`px-2 py-1 rounded text-sm ${Math.abs(d.gap) < 1e-6 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>Identity gap: {fmt0(d.gap)}</span>
          </div>
        </section>

        {/* Statements: IS left, BS right */}
        <section className="bg-white shadow rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-xl mb-6 text-center text-slate-800">Financial Statements</h2>
          <div className="grid xl:grid-cols-2 gap-8">
            {/* Income Statement */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-sm">
              <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg">
                <h3 className="font-bold text-lg text-center">Income Statement</h3>
                <p className="text-blue-100 text-sm text-center">For the Year Ended</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="border-b border-blue-200 pb-2">
                  <FinancialRow label="Revenue" color={C.revenue} input={<NumInput value={values.revenue} onChange={update("revenue")} />} />
                </div>
                
                <div className="space-y-2">
                  <FinancialRow label="Cost of Goods Sold" color={C.cogs} input={<NumInput value={values.cogs} onChange={update("cogs")} />} negative />
                  <FinancialRow label="Depreciation Expense" color={C.dep} input={<NumInput value={values.depreciation} onChange={update("depreciation")} style={highlight(["DEP→OCF","NCS→CFFA"])} />} negative />
                </div>
                
                <div className="border-t-2 border-blue-300 pt-2">
                  <FinancialRow label="Earnings Before Interest & Taxes (EBIT)" color={C.ebit} value={fmt0(d.EBIT)} emphasis total />
                </div>
                
                <div className="space-y-2 mt-4">
                  <FinancialRow label="Interest Expense" color={C.interest} input={<NumInput value={values.interestPaid} onChange={update("interestPaid")} style={highlight(["CFFA→Creditors"])} />} negative />
                  <FinancialRow label="Income Tax Expense" color={C.tax} input={<NumInput value={values.taxes} onChange={update("taxes")} style={highlight(["TAX→OCF"])} />} negative />
                </div>
                
                <div className="border-t-2 border-blue-400 pt-2 bg-blue-100 rounded px-3 py-2 -mx-1">
                  <FinancialRow label="Net Income" color={C.netIncome} value={fmt0(d.NetIncome)} emphasis total />
                </div>
                
                <div className="mt-4 space-y-2 border-t border-slate-300 pt-3">
                  <FinancialRow label="Dividends Paid" color={C.dividend} input={<NumInput value={values.dividends} onChange={update("dividends")} style={highlight(["CFFA→Stockholders"])} />} negative />
                  <FinancialRow label="Addition to Retained Earnings" color={C.retained} value={fmt0(d.RetainedAdd)} emphasis />
                </div>
                
                <div className="mt-4 p-3 bg-cyan-50 rounded border border-cyan-200">
                  <div className="text-xs font-semibold text-cyan-800 mb-1">Operating Cash Flow Calculation:</div>
                  <div className="text-xs text-cyan-700 font-mono">
                    OCF = EBIT + Depreciation − Taxes<br/>
                    OCF = {fmt0(d.EBIT)} + {fmt0(d.DEP)} − {fmt0(d.Tax)} = <span className="font-bold" style={{color:C.ocf}}>{fmt0(d.OCF)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm">
              <div className="bg-green-600 text-white px-5 py-3 rounded-t-lg">
                <h3 className="font-bold text-lg text-center">Balance Sheet</h3>
                <p className="text-green-100 text-sm text-center">Comparative Two Years</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-[2fr,1fr,1fr] gap-3 text-sm">
                  <div className="font-semibold text-green-800"></div>
                  <div className="text-center font-semibold text-green-700 border-b border-green-300 pb-1">Year 1</div>
                  <div className="text-center font-semibold text-green-700 border-b border-green-300 pb-1">Year 2</div>

                  {/* Assets Section */}
                  <div className="col-span-3 mt-4">
                    <div className="bg-green-600 text-white px-3 py-2 rounded font-bold text-center">ASSETS</div>
                  </div>
                  
                  <BSRow label="Current Assets" />
                  <NumInput value={values.begCA} onChange={update("begCA")} style={highlight(["ΔNWC→CFFA"])} />
                  <NumInput value={values.endCA} onChange={update("endCA")} style={highlight(["ΔNWC→CFFA"])} />

                  <BSRow label="Net Plant & Equipment" />
                  <NumInput value={values.begNetPPE} onChange={update("begNetPPE")} style={highlight(["NCS→CFFA"])} />
                  <NumInput value={values.endNetPPE} onChange={update("endNetPPE")} style={highlight(["NCS→CFFA"])} />
                  
                  <div className="col-span-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded border border-orange-200 mt-2">
                      <div className="text-xs font-semibold text-orange-800">Net Capital Spending (NCS):</div>
                      <div className="text-xs text-orange-700 font-mono">
                        NCS = Y2 − Y1 + Depreciation = {fmt0(num(values.endNetPPE))} − {fmt0(num(values.begNetPPE))} + {fmt0(num(values.depreciation))} = <span className="font-bold" style={{color:C.ncs}}>{fmt0(d.NCS)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities & Equity Section */}
                  <div className="col-span-3 mt-2">
                    <div className="bg-green-600 text-white px-3 py-2 rounded font-bold text-center">LIABILITIES & OWNERS' EQUITY</div>
                  </div>
                  
                  <BSRow label="Current Liabilities" />
                  <NumInput value={values.begCL} onChange={update("begCL")} style={highlight(["ΔNWC→CFFA"])} />
                  <NumInput value={values.endCL} onChange={update("endCL")} style={highlight(["ΔNWC→CFFA"])} />
                  
                  <div className="col-span-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded border border-blue-200 mt-2">
                      <div className="text-xs font-semibold text-blue-800">Change in Net Working Capital (ΔNWC):</div>
                      <div className="text-xs text-blue-700 font-mono">
                        ΔNWC = (Y2 CA − Y2 CL) − (Y1 CA − Y1 CL)<br/>
                        = ({fmt0(num(values.endCA))} − {fmt0(num(values.endCL))}) − ({fmt0(num(values.begCA))} − {fmt0(num(values.begCL))})<br/>
                        = <span className="font-bold" style={{color:C.dnwc}}>{fmt0(d.dNWC)}</span>
                      </div>
                    </div>
                  </div>

                  <BSRow label="Long-term Debt" />
                  <NumInput value={values.begLTD} onChange={update("begLTD")} style={highlight(["CFFA→Creditors"])} />
                  <NumInput value={values.endLTD} onChange={update("endLTD")} style={highlight(["CFFA→Creditors"])} />

                  <BSRow label="Common Stock + APIC" />
                  <NumInput value={values.begCSAPIC} onChange={update("begCSAPIC")} style={highlight(["CFFA→Stockholders"])} />
                  <NumInput value={values.endCSAPIC} onChange={update("endCSAPIC")} style={highlight(["CFFA→Stockholders"])} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section className="bg-white shadow rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-semibold text-lg">Conversion Flow — step by step</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={showAll} onChange={(e)=>{ setShowAll(e.target.checked); if(e.target.checked) setPlaying(false); }} /> Show all
              </label>
              {!showAll && (
                <>
                  <button className="px-3 py-1 border rounded" onClick={()=>setStepIndex((i)=>Math.max(0,i-1))}>Prev</button>
                  <button className="px-3 py-1 border rounded" onClick={()=>setStepIndex((i)=>Math.min(STEP_ORDER.length-1,i+1))}>Next</button>
                  <button className="px-3 py-1 border rounded" onClick={()=>setPlaying(p=>!p)}>{playing?"Pause":"Autoplay"}</button>
                </>
              )}
              <span className={`px-2 py-1 rounded text-sm ${Math.abs(d.gap) < 1e-6 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>Identity gap: {fmt0(d.gap)}</span>
              {scenario !== "custom" && <span className="text-xs text-slate-500">Scenario: {scenario}</span>}
            </div>
          </div>
          <FlowBig d={d} activeStep={activeStep} showAll={showAll} />
          {!showAll && (
            <div className="mt-2 text-xs text-slate-600">Step {stepIndex+1}/{STEP_ORDER.length}: <span className="font-mono">{activeStep}</span></div>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------- Big Flow Diagram ----------
function FlowBig({ d, activeStep, showAll }: { d: any; activeStep: StepKey; showAll: boolean }) {
  const W = 2000, H = 780; const boxW = 300, boxH = 62;
  const centerX = W / 2 - boxW / 2; const leftX = centerX - 600; const rightX = centerX + 600;
  const col = (s: "left"|"mid"|"right") => s==="left"?leftX:s==="right"?rightX:centerX; const row = (i:number)=>140+i*100;

  const nodes = {
    EBIT: { x: col("left"), y: row(0), color: C.ebit, label: "EBIT", val: d.EBIT },
    DEP:  { x: col("left"), y: row(1), color: C.dep,  label: "+ Depreciation", val: d.DEP },
    TAX:  { x: col("left"), y: row(2), color: C.tax,  label: "− Taxes", val: d.Tax },
    OCF:  { x: col("left"), y: row(3), color: C.ocf,  label: "= Operating Cash Flow", val: d.OCF },
    NCS:  { x: col("left"), y: row(4), color: C.ncs,  label: "− Net Capital Spending (NCS)", val: d.NCS },
    DNWC: { x: col("left"), y: row(5), color: C.dnwc, label: "− Δ Net Working Capital", val: d.dNWC },
    CFFA: { x: col("mid"), y: row(3), color: C.cffa, label: "Cash Flow From Assets (CFFA)", val: d.CFFA },
    CRED: { x: col("right"), y: row(4), color: C.cred, label: "Cash Flow to Creditors", val: d.CFtoCreditors },
    EQTY: { x: col("right"), y: row(5), color: C.eq,   label: "Cash Flow to Stockholders", val: d.CFtoStockholders },
  } as const;

  const usedByStep: Record<StepKey, (keyof typeof nodes)[]> = {
    "EBIT→OCF": ["EBIT", "OCF"],
    "DEP→OCF": ["DEP", "OCF"],
    "TAX→OCF": ["TAX", "OCF"],
    "OCF→CFFA": ["OCF", "CFFA"],
    "NCS→CFFA": ["NCS", "CFFA"],
    "ΔNWC→CFFA": ["DNWC", "CFFA"],
    "CFFA→Creditors": ["CFFA", "CRED"],
    "CFFA→Stockholders": ["CFFA", "EQTY"],
  };

  const Box = ({ id, big = false }: { id: keyof typeof nodes; big?: boolean }) => {
    const n = nodes[id]; const w = big ? boxW + 80 : boxW; const h = big ? boxH + 12 : boxH;
    const emphasizing = !showAll && usedByStep[activeStep].includes(id); const strokeW = emphasizing ? 5 : 3;
    return (
      <g transform={`translate(${n.x},${n.y})`}>
        <rect width={w} height={h} rx={16} fill="#fff" stroke={n.color} strokeWidth={strokeW} />
        <text x={14} y={30} fontSize={big ? 20 : 18}>{n.label}</text>
        <text x={w - 14} y={30} textAnchor="end" fontFamily="monospace" fontSize={big ? 20 : 18} fill={n.color}>{fmt0(n.val)}</text>
      </g>
    );
  };

  const Arrow = ({ from, to, color, label, weight = 2, step }:
    { from: keyof typeof nodes; to: keyof typeof nodes; color: string; label?: string; weight?: number; step: StepKey }) => {
    const A = nodes[from], B = nodes[to]; const show = showAll || STEP_ORDER.indexOf(activeStep) >= STEP_ORDER.indexOf(step); const isActive = !showAll && activeStep === step; if (!show) return null;
    const x1 = A.x + (from === "CFFA" ? 0 + 300 : 300); const y1 = A.y + 62/2; const x2 = B.x; const y2 = B.y + 62/2; const mx = (x1 + x2) / 2;
    const path = `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`; const dash = 1400; const strokeDash = isActive ? { strokeDasharray: dash, strokeDashoffset: dash, animation: "dash 0.9s ease forwards" } as any : {}; const headSize = 10;
    return (
      <g opacity={showAll ? 0.9 : isActive ? 1 : 0.5}>
        <defs>
          <marker id={`m-${color.replace('#','')}`} markerWidth={headSize} markerHeight={headSize} refX={headSize-2} refY={headSize/2} orient="auto">
            <path d={`M0,0 L0,${headSize} L${headSize},${headSize/2} z`} fill={color} />
          </marker>
        </defs>
        <path d={path} fill="none" stroke={color} strokeWidth={weight} markerEnd={`url(#m-${color.replace('#','')})`} style={strokeDash} />
        {label && (<text x={mx} y={(y1 + y2) / 2 - 12} textAnchor="middle" fontSize={14} fill={color}>{label}</text>)}
      </g>
    );
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-slate-50 rounded border">
      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
      <text x={nodes.EBIT.x} y={row(0) - 50} fontSize="16" fill="#475569">Income Statement + Reinvestment (Left)</text>
      <text x={nodes.CFFA.x} y={row(0) - 50} fontSize="16" fill="#475569">CFFA (Center)</text>
      <text x={nodes.CRED.x} y={row(0) - 50} fontSize="16" fill="#475569">Investors (Right)</text>
      <Box id="EBIT" /><Box id="DEP" /><Box id="TAX" /><Box id="OCF" /><Box id="NCS" /><Box id="DNWC" /><Box id="CFFA" big /><Box id="CRED" /><Box id="EQTY" />
      <Arrow step="EBIT→OCF" from="EBIT" to="OCF" color={C.arterial} label={`+ ${fmt0(d.EBIT)}`} />
      <Arrow step="DEP→OCF" from="DEP" to="OCF" color={C.arterial} label={`+ ${fmt0(d.DEP)}`} />
      <Arrow step="TAX→OCF" from="TAX" to="OCF" color={C.arterial} label={`− ${fmt0(d.Tax)}`} />
      <Arrow step="OCF→CFFA" from="OCF" to="CFFA" color={C.arterial} label={`= ${fmt0(d.OCF)}`} weight={3} />
      <Arrow step="NCS→CFFA" from="NCS" to="CFFA" color={C.arterial} label={`− ${fmt0(d.NCS)}`} />
      <Arrow step="ΔNWC→CFFA" from="DNWC" to="CFFA" color={C.arterial} label={`− ${fmt0(d.dNWC)}`} />
      <Arrow step="CFFA→Creditors" from="CFFA" to="CRED" color={C.venous} label={`to creditors: ${fmt0(d.CFtoCreditors)}`} />
      <Arrow step="CFFA→Stockholders" from="CFFA" to="EQTY" color={C.venous} label={`to stockholders: ${fmt0(d.CFtoStockholders)}`} />
    </svg>
  );
}

// ---------- UI helpers ----------
function FinancialRow({ label, value, input, color, emphasis = false, style, negative = false, total = false }:
  { label: string; value?: string; input?: React.ReactNode; color?: string; emphasis?: boolean; style?: React.CSSProperties; negative?: boolean; total?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${total ? 'border-t border-slate-300 pt-3' : ''}`} style={style}>
      <span className={`text-sm ${emphasis ? "font-bold" : "font-medium"} ${negative ? "pl-4" : ""}`}>
        {negative && "− "}{label}
      </span>
      <div className="flex-1 border-b border-dotted border-slate-300 mx-3"></div>
      {value && <span className={`font-mono text-sm min-w-[80px] text-right ${emphasis ? "font-bold" : ""}`} style={{ color }}>{value}</span>}
      {input && <div className="min-w-[120px]">{input}</div>}
    </div>
  );
}

function BSRow({ label }: { label: string }) { 
  return <div className="font-medium text-sm text-slate-700 py-1">{label}</div>; 
}

function KeyVal({ label, value, input, color, emphasis = false, style }:
  { label: string; value?: string; input?: React.ReactNode; color?: string; emphasis?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1" style={style}>
      <span className={`text-[15px] ${emphasis ? "font-semibold" : ""}`}>{label}</span>
      <div className="flex-1" />
      {value && <span className="font-mono text-[15px]" style={{ color }}>{value}</span>}
      {input}
    </div>
  );
}
function SectionRow({ label }: { label: string }) { return (<div className="col-span-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 mt-4 mb-1">{label}</div>); }
function LabelCell({ text }: { text: string }) { return <div>{text}</div>; }
function NumInput({ value, onChange, style }: { value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; style?: React.CSSProperties }) { return <input type="number" step="any" value={value} onChange={onChange} style={style} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right font-mono text-[14px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" />; }
function Formula({ children, color }: { children: React.ReactNode; color: string }) { return <div className="col-span-3 text-right text-[12px] italic" style={{ color }}>{children}</div>; }
