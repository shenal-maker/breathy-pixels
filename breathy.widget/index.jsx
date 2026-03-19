import { css } from "uebersicht";

const MODES = {
  octopus: {
    label: "Box Breathing",
    pattern: [4, 4, 4, 4],
    phases: ["Inhale", "Hold", "Exhale", "Hold"],
    sheet: "assets/octopus_sheet.png",
    frames: 7,
    size: 200,
    fact: "Box breathing activates the parasympathetic nervous system, reducing cortisol within 5 minutes.",
    bg: "#3dffc0",
  },
  turtle: {
    label: "HRV Breathing",
    pattern: [6, 0, 6, 0],
    phases: ["Inhale", "", "Exhale", ""],
    sheet: "assets/turtle_sheet.png",
    frames: 5,
    size: 165,
    fact: "6-6 HRV breathing maximises heart rate variability, linked to lower anxiety and better focus.",
    bg: "#38aadc",
  },
  dog: {
    label: "4-7-8 Breathing",
    pattern: [4, 7, 8, 0],
    phases: ["Inhale", "Hold", "Exhale", ""],
    sheet: "assets/dog_sheet.png",
    frames: 16,
    size: 192,
    fact: "4-7-8 breathing can reduce anxiety and help you fall asleep faster by activating the vagus nerve.",
    bg: "#1a2a4a",
  },
};

export const refreshFrequency = false;

export const command = "";

export const render = () => <Widget />;

function Widget() {
  const [mode, setMode] = React.useState("octopus");
  const [phaseIdx, setPhaseIdx] = React.useState(0);
  const [frame, setFrame] = React.useState(0);
  const [showFact, setShowFact] = React.useState(true);
  const timerRef = React.useRef(null);
  const frameRef = React.useRef(null);

  const m = MODES[mode];
  const totalFrames = m.frames;

  function startCycle(cfg, pIdx) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (frameRef.current) clearInterval(frameRef.current);

    const duration = cfg.pattern[pIdx] * 1000;
    const phase = cfg.phases[pIdx];

    if (duration === 0) {
      setPhaseIdx((pIdx + 1) % 4);
      startCycle(cfg, (pIdx + 1) % 4);
      return;
    }

    // animate frames
    if (phase === "Inhale") {
      let f = 0;
      setFrame(0);
      const interval = duration / (totalFrames - 1);
      frameRef.current = setInterval(() => {
        f = Math.min(f + 1, totalFrames - 1);
        setFrame(f);
        if (f >= totalFrames - 1) clearInterval(frameRef.current);
      }, interval);
    } else if (phase === "Exhale") {
      let f = totalFrames - 1;
      setFrame(f);
      const interval = duration / (totalFrames - 1);
      frameRef.current = setInterval(() => {
        f = Math.max(f - 1, 0);
        setFrame(f);
        if (f <= 0) clearInterval(frameRef.current);
      }, interval);
    }
    // Hold: frame stays put

    timerRef.current = setTimeout(() => {
      const next = (pIdx + 1) % 4;
      setPhaseIdx(next);
      startCycle(cfg, next);
    }, duration);
  }

  React.useEffect(() => {
    setPhaseIdx(0);
    setFrame(0);
    setShowFact(true);
    const t = setTimeout(() => setShowFact(false), 4000);
    startCycle(MODES[mode], 0);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [mode]);

  const phase = m.phases[phaseIdx];
  const bgPos = `-${frame * m.size}px 0px`;

  return (
    <div className={wrapper}>
      <div className={tabs}>
        {Object.keys(MODES).map((k) => (
          <button
            key={k}
            className={`${tab} ${mode === k ? activeTab : ""}`}
            onClick={() => setMode(k)}
          >
            {MODES[k].label}
          </button>
        ))}
      </div>

      <div className={canvas} style={{ background: m.bg }}>
        <div
          className={sprite}
          style={{
            width: m.size,
            height: m.size,
            backgroundImage: `url("breathy.widget/${m.sheet}")`,
            backgroundSize: `${m.size * m.frames}px ${m.size}px`,
            backgroundPosition: bgPos,
          }}
        />
        {phase ? <div className={phaseLabel}>{phase}</div> : null}
        {showFact && <div className={fact}>{m.fact}</div>}
      </div>
    </div>
  );
}

const wrapper = css`
  font-family: "Nunito", sans-serif;
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 220px;
`;

const tabs = css`
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
`;

const tab = css`
  flex: 1;
  padding: 4px 2px;
  font-size: 9px;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
`;

const activeTab = css`
  background: rgba(255,255,255,0.4);
  font-weight: 700;
`;

const canvas = css`
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 8px;
  position: relative;
`;

const sprite = css`
  background-repeat: no-repeat;
  image-rendering: pixelated;
`;

const phaseLabel = css`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  letter-spacing: 1px;
`;

const fact = css`
  font-size: 9px;
  color: rgba(255,255,255,0.85);
  text-align: center;
  padding: 0 8px;
  animation: fadeOut 4s forwards;
  @keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
`;
