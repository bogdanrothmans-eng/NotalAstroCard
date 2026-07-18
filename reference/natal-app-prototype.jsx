import React, { useReducer, useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } from "react";
import {
  ChevronLeft, Check, Clock, Settings as SettingsIcon, Star, Plus,
  Share2, Moon, RefreshCw, Trash2, CreditCard, X
} from "lucide-react";

/* =====================================================================================
   NATAL APP — clickable MVP prototype
   Дизайн снят со скриншотов Figma (Kids-app). Архитектура повторяет ТЗ:
   types -> mockNatalEngine -> store(actions) -> router -> screens.
   В реальном Next.js: state кладётся в Zustand + localStorage, маршруты в App Router.
   Здесь персист в localStorage недоступен (ограничение артефактов) — состояние в памяти.
   ===================================================================================== */

/* ----------------------------------- TOKENS ---------------------------------------- */
const T = {
  bg: "#0F0F0F",
  surface: "#171717",
  surface2: "#1C1C20",
  surfaceInput: "#171717",
  surfaceSelected: "#2A2A2A",
  border: "rgba(255,255,255,0.07)",
  borderSubtle: "#2C2C2C",
  borderStrong: "#FFFFFF",
  textPrimary: "#D9D9D9",
  textSecondary: "rgba(217,217,217,0.6)",
  textTertiary: "rgba(217,217,217,0.38)",
  body: "rgba(217,217,217,0.82)",
  placeholder: "rgba(233,233,233,0.5)",
  value: "#E9E9E9",
  white: "#FFFFFF",
  ink: "#000000",
  error: "#F0524F",
  badge: "#26262B",
  badgeText: "#B6B6BD",
  gradientCard: "linear-gradient(135deg,#1a2347 0%,#241d44 45%,#15151d 100%)",
  gradientPaywall: "linear-gradient(180deg, rgba(60,52,110,0.55) 0%, rgba(28,26,48,0.9) 100%)",
};
const R = { card: 16, button: 16, input: 16, chip: 16, tile: 16, back: 16 };

/* ------------------------------- MOCK NATAL ENGINE --------------------------------- */
/* generateShortNatalReport / generateFullNatalReport / generateNatalReport / generateTodayInsight
   Персонализируем имя, уважаем birthTimeAccuracy. Архитектура — чтобы заменить на реальный engine. */

function ascendantBlock(accuracy) {
  if (accuracy === "exact") {
    return {
      id: "asc", label: "Как тебя видят", title: "Асцендент в Скорпионе",
      text: "Снаружи ты можешь казаться собранным и сильным, даже внутри в этот момент идёт полный совет директоров из эмоций.",
      meta: "Астрологическая основа: Асцендент в Скорпионе",
    };
  }
  if (accuracy === "approximate") {
    return {
      id: "asc", label: "Как тебя видят", title: "Асцендент — примерно",
      text: "Время указано приблизительно, поэтому асцендент мы считаем мягко. Внешне ты, скорее всего, кажешься сдержаннее, чем чувствуешь себя внутри.",
      meta: "Рассчитано без точного времени",
    };
  }
  return {
    id: "asc", label: "Как тебя видят", title: "Асцендент пока недоступен",
    text: "Без точного времени рождения асцендент и дома рассчитать нельзя. Базовый портрет личности это не ломает — он остаётся точным.",
    meta: "Добавь время рождения, чтобы открыть этот блок",
  };
}

function generateShortNatalReport(b) {
  const name = b.name || "ты";
  return {
    title: `${name}, твоя натальная карта готова`,
    subtitle: "Сначала инсайты, потом астрологическая основа. Все простым языком",
    blocks: [
      {
        id: "sun", label: "Личность", title: "Солнце в тельце",
        text: "В твоём ядре много устойчивости. Ты не любишь хаос без смысла и лучше раскрываешься там, где есть понятный ритм, красота и ощущение опоры.",
        meta: "Астрологическая основа: Солнце в Тельце",
      },
      {
        id: "moon", label: "Эмоции", title: "Луна в Рыбах",
        text: "Внутри ты можешь быть чувствительнее, чем показываешь. Тебе важно, чтобы рядом было спокойно и безопасно, иначе включается защита.",
        meta: "Астрологическая основа: Луна в Рыбах",
      },
      ascendantBlock(b.birthTimeAccuracy),
      {
        id: "insight", label: "Главный инсайт", title: "Твой внутренний конфликт",
        text: "Одна часть тебя хочет стабильности и контроля, другая — глубины, эмоций и сильных переживаний. Из-за этого ты можешь одновременно стремиться к спокойствию и сам же усложнять себе жизнь.",
      },
    ],
  };
}

const blk = (id, title, text, sub) => ({ id, title, text, subtitle: sub });

function generateFullNatalReport(b) {
  const showAsc = b.birthTimeAccuracy === "exact";
  return {
    overview: [
      blk("ov1", "Общий портрет", "Тебе важно чувствовать опору, но внутри много тонкой чувствительности. Ты можешь долго наблюдать, прежде чем действовать, зато включаешься глубоко и надолго."),
      blk("ov2", "Главная сила", "Способность выдерживать сложное, не разваливаясь. Там, где другие торопятся, ты умеешь оставаться устойчивым."),
      blk("ov3", "Главная зона роста", "Иногда тебе свойственно держать всё в себе. Учиться вовремя говорить о своих границах — твой большой ресурс."),
      blk("ov4", "Баланс стихий", showAsc ? "Земля даёт опору, вода — чувствительность. Воздуха и огня чуть меньше, поэтому решения ты любишь обдумывать." : "Земля и вода в балансе. Без точного времени картину домов мы не достраиваем, но характер виден ясно."),
    ],
    personality: [
      blk("p1", "Ядро личности", "Тебе важно видеть смысл и практическую пользу в том, что ты делаешь. Когда цель понятна, ты становишься очень устойчивым."),
      blk("p2", "Как ты проявляешься", "Спокойно снаружи, насыщенно внутри. Люди не всегда догадываются, сколько всего ты проживаешь под ровной поверхностью."),
      blk("p3", "Внутренний ритм", "Тебе комфортнее в своём темпе. Спешка сбивает тебя сильнее, чем кажется со стороны."),
      blk("p4", "Ключевой паттерн", "Когда тебе кажется, что тебя не слышат, ты можешь защищаться резче, чем сам планировал."),
    ],
    emotions: [
      blk("e1", "Что тебе нужно эмоционально", "Чувство безопасности и предсказуемости. С ним ты раскрываешься, без него — закрываешься."),
      blk("e2", "Что выводит из равновесия", "Резкие перемены и ощущение, что тебя торопят с тем, что для тебя важно."),
      blk("e3", "Как ты восстанавливаешься", "Тишина, привычные ритуалы и пара близких людей рядом. Толпа скорее истощает."),
      blk("e4", "Как включается защита", "Ты можешь уходить в себя и становиться будто бы холоднее, хотя внутри в этот момент чувствуешь больше всего."),
    ],
    relationships: [
      blk("r1", "Как ты сближаешься", "Постепенно и по-настоящему. Тебе важно доверие, а оно у тебя растёт не за один вечер."),
      blk("r2", "Что тебе важно в партнёре", "Надёжность и эмоциональная честность. Игры в угадайку — не твоя история."),
      blk("r3", "Что может ранить", "Обесценивание твоих чувств и ощущение, что тебя оставляют разбираться в одиночку."),
      blk("r4", "Что помогает близости", "Спокойные разговоры без давления. Когда тебя не торопят, ты открываешься гораздо больше."),
    ],
    workAndMoney: [
      blk("w1", "Где ты раскрываешься", "Там, где можно делать качественно и без вечной гонки. Ты любишь доводить до результата."),
      blk("w2", "Как ты работаешь", "Основательно. Тебе важно понимать зачем — тогда ты выдаёшь стабильно сильный результат."),
      blk("w3", "Что тебя мотивирует", "Ощутимый смысл и видимый прогресс, а не абстрактные обещания."),
      blk("w4", "Что может мешать", "Перфекционизм и желание всё контролировать самому. Делегировать бывает непросто."),
      blk("w5", "Деньги и стабильность", "Тебе спокойнее, когда есть подушка и понятный план. Резкие финансовые риски — не твой комфорт."),
    ],
    strengths: [
      blk("s1", "Глубина", "Ты воспринимаешь больше, чем проговариваешь."),
      blk("s2", "Чувствительность к людям", "Ты считываешь настроение раньше, чем его озвучат."),
      blk("s3", "Устойчивость", "В сложном ты держишься, когда другие сдаются."),
      blk("s4", "Фокус", "Если тема твоя — ты погружаешься без остатка."),
      blk("s5", "Интуиция", "Внутреннее «что-то не то» у тебя обычно небеспочвенно."),
    ],
    growthZones: [
      blk("g1", "Склонность всё контролировать", "Иногда стоит позволить части вещей идти своим ходом — мир выдержит."),
      blk("g2", "Эмоциональная перегрузка", "Ты можешь копить переживания дольше, чем полезно. Выпускать их вовремя — навык, который качается."),
      blk("g3", "Сложность просить поддержку", "Просить помощь — не слабость. Тебе можно опираться на других, не только на себя."),
    ],
    recommendations: [
      blk("rc1", "Эмоции", "Не принимай важные решения на пике раздражения. Сначала дай себе время вернуться в спокойное состояние."),
      blk("rc2", "Работа", "Раз в неделю отмечай, что уже сделано. Тебе это возвращает ощущение опоры."),
      blk("rc3", "Отношения", "Говори о своих границах раньше, чем они нарушены, а не после."),
      blk("rc4", "Энергия", "Закладывай тихие паузы заранее — не как награду, а как часть режима."),
      blk("rc5", "Деньги", "Небольшая регулярная подушка успокаивает тебя сильнее, чем разовые рывки."),
    ],
  };
}

function generateNatalReport(birthData) {
  return {
    id: "r_" + Math.random().toString(36).slice(2, 9),
    birthData,
    status: "short",
    isUnlocked: false,
    createdAt: new Date().toISOString(),
    shortReport: generateShortNatalReport(birthData),
    fullReport: generateFullNatalReport(birthData),
  };
}
const TODAY_INSIGHTS = [
  "Ты можешь быстрее уставать не от задач, а от людей, с которыми приходится быть не собой.",
  "Сегодня тебе проще действовать, когда есть понятный план. Дай себе его.",
  "Не путай тишину с равнодушием — тебе иногда просто нужно побыть в своём ритме.",
];
function generateTodayInsight(report) {
  const seed = report ? report.createdAt.length : 0;
  return TODAY_INSIGHTS[seed % TODAY_INSIGHTS.length];
}

/* --------------------------------- STORE (reducer) --------------------------------- */
const emptyBirth = {
  name: "", gender: null, birthDate: "", birthTime: "",
  birthTimeAccuracy: "exact", approximatePeriod: undefined, birthPlace: "",
};
const initialState = {
  birthData: { ...emptyBirth },
  reports: [],
  lastOpenedReportId: null,
  settings: { insightOfDay: true, newFeatures: false },
};
function reducer(s, a) {
  switch (a.type) {
    case "SET_BIRTH": return { ...s, birthData: { ...s.birthData, ...a.partial } };
    case "RESET_BIRTH": return { ...s, birthData: { ...emptyBirth } };
    case "CREATE_REPORT": {
      const report = generateNatalReport(s.birthData);
      return { ...s, reports: [report, ...s.reports], lastOpenedReportId: report.id };
    }
    case "UNLOCK": return {
      ...s, reports: s.reports.map(r => r.id === a.id ? { ...r, isUnlocked: true, status: "full" } : r),
    };
    case "SET_LAST_OPENED": return { ...s, lastOpenedReportId: a.id };
    case "DELETE_REPORT": return { ...s, reports: s.reports.filter(r => r.id !== a.id) };
    case "CLEAR_ALL": return { ...initialState, birthData: { ...emptyBirth } };
    case "UPDATE_SETTINGS": return { ...s, settings: { ...s.settings, ...a.partial } };
    default: return s;
  }
}
const StoreCtx = createContext(null);
const useStore = () => useContext(StoreCtx);

/* ------------------------------------ ROUTER --------------------------------------- */
const RouteCtx = createContext(null);
const useRoute = () => useContext(RouteCtx);

/* --------------------------------- SHARED UI BITS ---------------------------------- */
function BrandMark({ size = 26, glow = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {glow && <div style={{
        position: "absolute", inset: -size * 0.7, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)",
        filter: "blur(2px)",
      }} />}
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ position: "relative" }}>
        <circle cx="16" cy="16" r="15" fill={T.white} />
        <path d="M21 16a8 8 0 1 1-8-8 6.4 6.4 0 1 0 8 8Z" fill={T.ink} />
      </svg>
    </div>
  );
}

function StepMoon() {
  // layers (bottom→top): #2A2A2A 24px base (in Stepper) ← white 14px disc w/ glow ← #171717 moon 12px
  return (
    <div style={{ position: "relative", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 16px 2px rgba(255,255,255,0.85)" }} />
      <Moon size={12} color="#171717" fill="#171717" strokeWidth={0} style={{ position: "relative" }} />
    </div>
  );
}
function Stepper({ step }) {
  // shared base: #2A2A2A circle + white 35% stroke. future=empty, done=check, active=white disc + dark moon
  const items = [1, 2, 3];
  const base = {
    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#2A2A2A", border: "1px solid rgba(255,255,255,0.35)",
  };
  return (
    <div className="flex items-center w-full" style={{ gap: 0, marginBottom: 28 }}>
      {items.map((n, i) => {
        const done = n < step, active = n === step;
        return (
          <React.Fragment key={n}>
            <div style={base}>
              {active ? <StepMoon /> : done ? <Check size={13} color="rgba(255,255,255,0.7)" strokeWidth={2.5} /> : null}
            </div>
            {i < items.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: "0 8px", borderTop: "1.5px dashed rgba(255,255,255,0.22)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? "#3A3A3D" : T.white,
        color: disabled ? "#9a9aa0" : T.ink,
        border: "none", borderRadius: R.button, height: 56, width: "100%",
        fontSize: 16, fontWeight: 500, cursor: disabled ? "default" : "pointer",
        transition: "transform .12s ease, opacity .2s ease",
        ...style,
      }}>
      {children}
    </button>
  );
}
function SecondaryButton({ children, onClick, outlined }) {
  return (
    <button onClick={onClick}
      style={{
        background: T.surface, color: T.textPrimary,
        border: outlined ? `1px solid ${T.border}` : "none",
        borderRadius: R.button, height: 56, width: "100%", fontSize: 15, fontWeight: 500, cursor: "pointer",
      }}>
      {children}
    </button>
  );
}
function BackSquare({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 56, height: 56, borderRadius: R.back, background: T.surface,
      border: "none", display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, cursor: "pointer",
    }}>
      <ChevronLeft size={22} color={T.textPrimary} />
    </button>
  );
}

/* Screen shell: scroll area + sticky bottom bar (pinned CTA, safe area aware) */
function Screen({ children, bottom, pad = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: pad ? "24px 16px 16px" : 0 }}>
        {children}
      </div>
      {bottom && (
        <div style={{ padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", background: T.bg }}>
          {bottom}
        </div>
      )}
    </div>
  );
}

function Title({ children }) {
  return <h1 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: 0 }}>{children}</h1>;
}
function Subtitle({ children }) {
  return <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.45, margin: "8px 0 0" }}>{children}</p>;
}
function FieldLabel({ children }) {
  return <div style={{ color: T.textSecondary, fontSize: 12, marginBottom: 6 }}>{children}</div>;
}

function TextField({ value, onChange, placeholder, error, focusedExternally, onFocus, onBlur, inputMode, maxLength }) {
  const [focused, setFocused] = useState(false);
  const isFocused = focused || focusedExternally;
  return (
    <div>
      <div style={{
        background: T.surfaceInput, borderRadius: R.input, height: 56,
        display: "flex", alignItems: "center", padding: "0 16px",
        border: isFocused ? `1px solid ${T.borderStrong}` : `1px solid transparent`,
        transition: "border-color .15s ease",
      }}>
        <input
          value={value} onChange={onChange} placeholder={placeholder}
          inputMode={inputMode} maxLength={maxLength}
          onFocus={() => { setFocused(true); onFocus && onFocus(); }}
          onBlur={() => { setFocused(false); onBlur && onBlur(); }}
          style={{
            background: "transparent", border: "none", outline: "none", width: "100%",
            color: T.value, fontSize: 16, letterSpacing: "-0.32px", caretColor: T.white,
          }}
        />
      </div>
      {error && <div style={{ color: T.error, fontSize: 13, marginTop: 10, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.surface, borderRadius: R.card, padding: 16,
      border: `1px solid ${T.borderSubtle}`, ...style,
    }}>{children}</div>
  );
}

function ReportBlock({ b }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(b.label || b.subtitle) && <div style={{ color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{b.label || b.subtitle}</div>}
        <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>{b.title}</div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{b.text}</div>
      {b.meta && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{b.meta}</div>}
    </div>
  );
}

/* ----------------------------- VALIDATION + MASKS ---------------------------------- */
function maskDate(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "." + d.slice(2, 4);
  if (d.length > 4) out += "." + d.slice(4, 8);
  return out;
}
function validateDate(v) {
  if (!v) return "Введите дату рождения";
  const m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "Укажи корректную дату рождения";
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  if (mm < 1 || mm > 12) return "Укажи корректную дату рождения";
  if (dd < 1 || dd > 31) return "Укажи корректную дату рождения";
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd)
    return "Укажи корректную дату рождения";
  if (date > new Date()) return "Дата рождения не может быть в будущем";
  if (yyyy < 1900) return "Укажи корректную дату рождения";
  return null;
}
function maskTime(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ":" + d.slice(2, 4);
  return out;
}
function validateTime(v) {
  if (!v) return "Укажи корректное время рождения";
  const m = v.match(/^(\d{2}):(\d{2})$/);
  if (!m) return "Укажи корректное время рождения";
  const hh = +m[1], mi = +m[2];
  if (hh > 23 || mi > 59) return "Укажи корректное время рождения";
  return null;
}

/* ========================================================================
   SCREENS
   ======================================================================== */

function StartScreen() {
  const { go } = useRoute();
  return (
    <Screen bottom={
      <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <PrimaryButton onClick={() => go("enterName")}>Начать разбор</PrimaryButton>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>Без подписки и сложных терминов</div>
      </div>
    }>
      <div style={{ marginTop: 4 }}><ZodiacWheel h={300} /></div>
      <h1 style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 700, lineHeight: 1.2, margin: "16px 0 24px" }}>
        Узнай себя через натальную карту
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          ["Личность", "Что в тебе главное и как ты принимаешь решения"],
          ["Эмоции", "Что тебе нужно, чтобы чувствовать себя спокойно"],
          ["Отношения", "Как ты любишь, сближаешься и защищаешься"],
          ["Сильные стороны", "Где твой природный потенциал"],
        ].map(([t, s]) => (
          <div key={t} style={{ background: T.surface, borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>{t}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>{s}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function EnterNameScreen() {
  const { state, dispatch } = useStore();
  const { go, back } = useRoute();
  const [name, setName] = useState(state.birthData.name);
  const [gender, setGender] = useState(state.birthData.gender);
  const [touched, setTouched] = useState(false);
  const error = touched && !name.trim() ? "Введите имя" : null;

  const next = () => {
    if (!name.trim()) { setTouched(true); return; }
    dispatch({ type: "SET_BIRTH", partial: { name: name.trim(), gender } });
    go("birthday");
  };
  const GenderBtn = ({ val, label }) => {
    const sel = gender === val;
    return (
      <button onClick={() => setGender(val)} style={{
        flex: 1, height: 50, borderRadius: R.chip, cursor: "pointer",
        background: sel ? T.surfaceSelected : T.surface, color: "#FFFFFF", fontSize: 14, fontWeight: 500,
        border: `1px solid ${sel ? T.borderStrong : T.borderSubtle}`,
      }}>{label}</button>
    );
  };
  return (
    <Screen bottom={
      <div style={{ display: "flex", gap: 12 }}>
        <BackSquare onClick={back} />
        <PrimaryButton onClick={next}>Продолжить</PrimaryButton>
      </div>
    }>
      <Stepper step={1} />
      <Title>Введите имя</Title>
      <Subtitle>Нужно для персонализации</Subtitle>
      <div style={{ marginTop: 18 }}>
        <TextField value={name} placeholder="Например Дарья"
          onChange={(e) => setName(e.target.value)} error={error} />
      </div>
      <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, margin: "28px 0 14px" }}>Укажите пол</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <GenderBtn val="female" label="Женский" />
        <GenderBtn val="male" label="Мужской" />
      </div>
    </Screen>
  );
}

function BirthdayScreen() {
  const { state, dispatch } = useStore();
  const { go, back } = useRoute();
  const [date, setDate] = useState(state.birthData.birthDate);
  const [touched, setTouched] = useState(false);
  const error = touched ? validateDate(date) : null;
  const next = () => {
    const err = validateDate(date);
    if (err) { setTouched(true); return; }
    dispatch({ type: "SET_BIRTH", partial: { birthDate: date } });
    go("timeBirth");
  };
  return (
    <Screen bottom={
      <div style={{ display: "flex", gap: 12 }}>
        <BackSquare onClick={back} />
        <PrimaryButton onClick={next}>Продолжить</PrimaryButton>
      </div>
    }>
      <Stepper step={2} />
      <Title>Дата рождения</Title>
      <Subtitle>От неё зависит знак зодиака, натальная карта и прогнозы</Subtitle>
      <div style={{ marginTop: 18 }}>
        <TextField value={date} placeholder="00.00.0000" inputMode="numeric" maxLength={10}
          onChange={(e) => { setDate(maskDate(e.target.value)); if (touched) setTouched(false); }}
          error={error} />
      </div>
    </Screen>
  );
}

const ACCURACY = [
  { key: "exact", label: "Точно" },
  { key: "approximate", label: "Примерно" },
  { key: "unknown", label: "Не знаю" },
];
const PERIODS = [
  { key: "morning", label: "Утро" }, { key: "day", label: "День" },
  { key: "evening", label: "Вечер" }, { key: "night", label: "Ночь" },
];

function TimeBirthScreen() {
  const { state, dispatch } = useStore();
  const { go, back } = useRoute();
  const b = state.birthData;
  const [accuracy, setAccuracy] = useState(b.birthTimeAccuracy || "exact");
  const [time, setTime] = useState(b.birthTime || "");
  const [period, setPeriod] = useState(b.approximatePeriod);
  const [place, setPlace] = useState(b.birthPlace || "");
  const [touched, setTouched] = useState(false);

  const timeErr = accuracy === "exact" && touched ? validateTime(time) : null;
  const periodErr = accuracy === "approximate" && touched && !period ? "Выбери период рождения" : null;
  const placeErr = touched && place.trim().length < 2 ? "Укажи место рождения" : null;

  const canProceed = () => {
    if (place.trim().length < 2) return false;
    if (accuracy === "exact") return !validateTime(time);
    if (accuracy === "approximate") return !!period;
    return true;
  };
  const next = () => {
    if (!canProceed()) { setTouched(true); return; }
    dispatch({
      type: "SET_BIRTH", partial: {
        birthTimeAccuracy: accuracy,
        birthTime: accuracy === "exact" ? time : "",
        approximatePeriod: accuracy === "approximate" ? period : undefined,
        birthPlace: place.trim(),
      }
    });
    go("check");
  };

  const Seg = ({ item }) => {
    const sel = accuracy === item.key;
    return (
      <button onClick={() => { setAccuracy(item.key); setTouched(false); }} style={{
        flex: 1, height: 50, borderRadius: R.chip, cursor: "pointer", fontSize: 14, fontWeight: 500,
        background: sel ? T.white : T.surface, color: sel ? "#000000" : "#FFFFFF",
        border: `1px solid ${sel ? T.white : T.borderSubtle}`,
      }}>{item.label}</button>
    );
  };
  const PeriodBtn = ({ item }) => {
    const sel = period === item.key;
    return (
      <button onClick={() => setPeriod(item.key)} style={{
        height: 56, borderRadius: R.chip, cursor: "pointer", fontSize: 14, fontWeight: 500,
        background: sel ? T.surfaceSelected : T.surface, color: "#FFFFFF",
        border: `1px solid ${sel ? T.borderStrong : T.borderSubtle}`,
      }}>{item.label}</button>
    );
  };

  return (
    <Screen bottom={
      <div style={{ display: "flex", gap: 12 }}>
        <BackSquare onClick={back} />
        <PrimaryButton onClick={next}>Продолжить</PrimaryButton>
      </div>
    }>
      <Stepper step={3} />
      <Title>Время рождения</Title>
      <Subtitle>Без точного времени разбор будет менее точным. Асцендент и дома определить сложно, но базовый портрет личности покажем.</Subtitle>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {ACCURACY.map(a => <Seg key={a.key} item={a} />)}
      </div>

      {accuracy === "exact" && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            background: T.surfaceInput, borderRadius: R.input, height: 60,
            display: "flex", alignItems: "center", padding: "0 18px",
            border: `1px solid transparent`,
          }}>
            <input value={time} placeholder="00:00" inputMode="numeric" maxLength={5}
              onChange={(e) => setTime(maskTime(e.target.value))}
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: T.textPrimary, fontSize: 16 }} />
          </div>
          {timeErr && <div style={{ color: T.error, fontSize: 13, marginTop: 10 }}>{timeErr}</div>}
        </div>
      )}

      {accuracy === "approximate" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            {PERIODS.map(p => <PeriodBtn key={p.key} item={p} />)}
          </div>
          {periodErr && <div style={{ color: T.error, fontSize: 13, marginTop: 10 }}>{periodErr}</div>}
        </>
      )}

      <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, margin: "26px 0 14px" }}>Место рождения</h2>
      <TextField value={place} placeholder="Например Московская обл., Пушкино"
        onChange={(e) => setPlace(e.target.value)} error={placeErr} />
    </Screen>
  );
}

const PERIOD_LABEL = { morning: "Утро", day: "День", evening: "Вечер", night: "Ночь" };
function timeLabel(b) {
  if (b.birthTimeAccuracy === "exact") return b.birthTime || "—";
  if (b.birthTimeAccuracy === "approximate") return PERIOD_LABEL[b.approximatePeriod] || "Примерно";
  return "Не знаю";
}

function CheckScreen() {
  const { state, dispatch } = useStore();
  const { go, back } = useRoute();
  const b = state.birthData;
  const rows = [
    ["Имя", b.name],
    ["Дата рождения", b.birthDate],
    ["Время рождения", timeLabel(b)],
    ["Место рождения", b.birthPlace],
  ];
  const build = () => { dispatch({ type: "CREATE_REPORT" }); go("loading"); };
  return (
    <Screen bottom={
      <div style={{ display: "flex", gap: 12 }}>
        <BackSquare onClick={back} />
        <PrimaryButton onClick={build}>Построить карту</PrimaryButton>
      </div>
    }>
      <Stepper step={3} />
      <Title>Проверь данные</Title>
      <Subtitle>По ним мы построим натальную карту. Если что-то указано неверно, разбор может получиться неточным.</Subtitle>
      <Card style={{ marginTop: 24, padding: 16 }}>
        {rows.map(([label, val], i) => (
          <div key={label} style={{ paddingTop: i ? 8 : 0, marginTop: i ? 8 : 0, borderTop: i ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div style={{ color: T.textSecondary, fontSize: 10, letterSpacing: "0.12px", lineHeight: 1.3 }}>{label}</div>
            <div style={{ color: T.value, fontSize: 16, marginTop: 2, lineHeight: "24px" }}>{val || "—"}</div>
          </div>
        ))}
      </Card>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => go("enterName")} style={{
          width: "100%", height: 50, borderRadius: R.button, background: T.surface,
          border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>Изменить данные</button>
      </div>
    </Screen>
  );
}

const LOADING_LINES = [
  "Ищем, где у тебя спрятан внутренний двигатель",
  "Меркурий не ретроградный, просто думаем",
  "Собираем карту без хрустального шара. Почти...",
];
function LoadingScreen() {
  const { state } = useStore();
  const { go } = useRoute();
  const [idx, setIdx] = useState(0);
  const report = state.reports[0];
  const canvasRef = useRef(null);

  useEffect(() => {
    const t1 = setInterval(() => setIdx(i => (i + 1) % LOADING_LINES.length), 1500);
    const t2 = setTimeout(() => { if (report) go("short", { id: report.id }); }, 5000);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const SIZE = 380;
    canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    const cx = SIZE / 2, cy = SIZE / 2;

    const N = 34; // more particles
    const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // golden angle → even angular spread
    const particles = Array.from({ length: N }, (_, i) => {
      const baseR = 72 + (i / (N - 1)) * 108 + (Math.random() - 0.5) * 16; // spread across annulus ~72..180
      return {
        angle: i * GOLDEN + (Math.random() - 0.5) * 0.4,
        baseR,
        speed: 0.4 + Math.random() * 0.55,               // orbit rad/s
        size: 0.8 + Math.random() * 3.0,                 // varied sizes
        wob: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.5,
      };
    });

    const DURATION = 5000, DRAIN_START = 3200;
    let start = null, last = null, raf;
    const tick = (ts) => {
      if (start == null) { start = ts; last = ts; }
      const t = ts - start;
      let dt = (ts - last) / 1000; last = ts;
      if (dt > 0.05) dt = 0.05;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const drainRaw = t <= DRAIN_START ? 0 : Math.min(1, (t - DRAIN_START) / (DURATION - DRAIN_START));
      const ease = drainRaw * drainRaw * (3 - 2 * drainRaw); // smoothstep → drain

      particles.forEach((p) => {
        const angSpeed = p.speed * (1 + ease * 6);          // swirl faster as it drains
        p.angle += angSpeed * dt;
        const rr = p.baseR * (1 - ease) + Math.sin(ts / 650 + p.wob) * 4 * (1 - ease);
        const x = cx + Math.cos(p.angle) * rr;
        const y = cy + Math.sin(p.angle) * rr;
        const fade = Math.min(1, rr / 38);                  // fade as it reaches the center drain
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * fade})`;
        ctx.shadowColor = "rgba(255,255,255,0.7)";
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (t < DURATION) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Screen>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 360, aspectRatio: "1", margin: "0 auto" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 24, textAlign: "center", padding: "0 24px" }}>
          <div style={{ color: T.textPrimary, fontSize: 19, fontWeight: 700 }}>Строим твою натальную карту</div>
          <div key={idx} style={{ color: T.textSecondary, fontSize: 14, marginTop: 10, maxWidth: 260, marginLeft: "auto", marginRight: "auto", animation: "fadeIn .6s ease" }}>
            {LOADING_LINES[idx]}
          </div>
        </div>
      </div>
    </Screen>
  );
}

function ShortReportScreen({ params }) {
  const { state } = useStore();
  const { go, reset } = useRoute();
  const report = state.reports.find(r => r.id === params.id) || state.reports[0];
  if (!report) return <EmptyState />;
  const sr = report.shortReport;
  return (
    <Screen>
      <h1 style={{ color: T.textPrimary, fontSize: 32, fontWeight: 700, lineHeight: 1.0, letterSpacing: "0.12px", margin: 0 }}>{sr.title}</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>{sr.subtitle}</p>

      {sr.blocks.map(b => <ReportBlock key={b.id} b={b} />)}

      {/* Paywall teaser — #171717 card with soft violet glow blobs */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, padding: 16, marginTop: 0, background: T.surface, border: `1px solid ${T.borderSubtle}`, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "absolute", top: -28, left: -12, width: 130, height: 80, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.55), rgba(140,99,255,0))", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, right: -28, width: 90, height: 170, background: "radial-gradient(ellipse at center, rgba(110,90,235,0.5), rgba(110,90,235,0))", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: -28, width: 64, height: 170, background: "radial-gradient(ellipse at center, rgba(150,99,255,0.45), rgba(150,99,255,0))", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>Полный разбор</div>
          <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Мы откроем больше</div>
        </div>
        <ul style={{ position: "relative", margin: 0, paddingLeft: 21, color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4, display: "flex", flexDirection: "column", gap: 2 }}>
          <li>Как ты проявляешься в отношениях</li>
          <li>Что тебя заряжает и выматывает</li>
          <li>Где твои сильные стороны</li>
          <li>Какие паттерны могут мешать</li>
          <li>Как ты работаешь и принимаешь решения</li>
          <li>Персональные рекомендации</li>
        </ul>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => report.isUnlocked ? go("full", { id: report.id }) : go("paywall", { id: report.id })}
            style={{ width: "100%", height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Открыть полный разбор
          </button>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>Один платёж. Без подписки.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0 8px" }}>
        <button onClick={() => reset("main")} style={{ width: "100%", height: 50, borderRadius: 16, background: T.surfaceSelected, border: `1px solid ${T.borderStrong}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Вернуться на главную</button>
        <button onClick={() => reset("enterName")} style={{ width: "100%", height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Попробовать ещё раз</button>
      </div>
    </Screen>
  );
}

/* zodiac wheel line-art (stand-in for the exported Figma illustration) */
function ZodiacWheel({ h = 180 }) {
  const glyphs = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const cx = 160, cy = 150, R1 = 118, R2 = 94;
  return (
    <svg viewBox="0 0 320 300" width="100%" height={h} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      {[...Array(46)].map((_, i) => (
        <circle key={"s" + i} cx={(i * 73) % 320} cy={(i * 131) % 300} r={i % 6 === 0 ? 1.5 : 0.7} fill="rgba(255,255,255,0.5)" />
      ))}
      <g stroke="rgba(255,255,255,0.45)" fill="none" strokeWidth="1">
        <circle cx={cx} cy={cy} r={R1} />
        <circle cx={cx} cy={cy} r={R2} />
        {glyphs.map((_, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; return <line key={i} x1={cx + Math.cos(a) * R2} y1={cy + Math.sin(a) * R2} x2={cx + Math.cos(a) * R1} y2={cy + Math.sin(a) * R1} />; })}
      </g>
      <g stroke="rgba(255,255,255,0.13)" fill="none" strokeWidth="1">
        {[...Array(12)].map((_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={"c" + i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R2} y2={cy + Math.sin(a) * R2} />; })}
        <circle cx={cx} cy={cy} r={R2 * 0.5} />
      </g>
      {glyphs.map((g, i) => { const a = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2; const rr = (R1 + R2) / 2; return <text key={g} x={cx + Math.cos(a) * rr} y={cy + Math.sin(a) * rr + 4} fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">{g}</text>; })}
      {/* face profile facing right */}
      <path d="M150 92 c 22 2 34 22 34 50 c 0 16 -6 24 -10 32 c -3 6 2 12 8 12 c -2 8 -12 10 -20 6 c -16 -8 -28 -28 -28 -52 c 0 -28 14 -46 24 -50 z" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.85)" />
      {/* crescent moon top-right */}
      <g transform="translate(270,52)"><path d="M0 -13 a13 13 0 1 0 0 26 a9.5 9.5 0 1 1 0 -26 z" fill="rgba(255,255,255,0.85)" /></g>
    </svg>
  );
}

function PaywallScreen({ params }) {
  const { state, dispatch } = useStore();
  const { go, back } = useRoute();
  const report = state.reports.find(r => r.id === params.id) || state.reports[0];
  const [slide, setSlide] = useState(2);
  const [processing, setProcessing] = useState(null); // method key while processing
  const slides = [
    ["Личность", "Что у тебя в ядре и как это проявляется в характере"],
    ["Эмоции", "Что тебе важно, что выводит из равновесия и как ты восстанавливаешься"],
    ["Отношения", "Как ты сближаешься, чего ждём от партнёра и что может тебя ранить"],
    ["Работа", "Где ты раскрываешься, что мотивирует и как ты принимаешь решения"],
  ];
  const pay = (method) => {
    if (processing) return;
    setProcessing(method);
    setTimeout(() => {
      dispatch({ type: "UNLOCK", id: report.id });
      setProcessing(null);
      go("full", { id: report.id });
    }, 1500);
  };
  if (!report) return <EmptyState />;
  return (
    <Screen>
      <div style={{ marginBottom: 16 }}><BackSquare onClick={back} /></div>

      {/* hero card: illustration on top, caption below, dots under */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ width: "100%", background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 8, overflow: "hidden" }}><ZodiacWheel h={189} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>{slides[slide][0]}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{slides[slide][1]}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {slides.map((_, i) => (
            <span key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 8 : 6, height: i === slide ? 8 : 6, borderRadius: "50%", cursor: "pointer",
              background: i === slide ? T.white : "rgba(255,255,255,0.3)",
            }} />
          ))}
        </div>
      </div>

      <h1 style={{ color: T.textPrimary, fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "24px 0 0" }}>
        Откройте полный разбор натальной карты
      </h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>
        Мы уже рассчитали карту. В полном отчёте покажем, как она проявляется в характере, эмоциях, отношениях, работе и личных решениях
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
        <PaymentRow icon={<Star size={16} color="#FFFFFF" fill="#FFFFFF" />} title="Telegram Stars"
          sub="Мгновенно, прямо в Telegram"
          right={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>150 <Star size={14} color="#FFFFFF" fill="#FFFFFF" /></span>}
          onClick={() => pay("telegram_stars")} loading={processing === "telegram_stars"} />
        <PaymentRow icon={<CreditCard size={16} color="#FFFFFF" />} title="Карта, СБП, T-Pay"
          sub="Оплата на странице ЮKassa" right="190 ₽"
          onClick={() => pay("russian_card")} loading={processing === "russian_card"} />
      </div>
    </Screen>
  );
}

function PaymentRow({ icon, title, sub, right, onClick, loading }) {
  return (
    <div onClick={loading ? undefined : onClick} style={{
      background: T.surface, borderRadius: 16, height: 68, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 16px", cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 72, background: "#282828", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
        {loading ? <RefreshCw size={16} color="rgba(255,255,255,0.6)" style={{ animation: "spin 1s linear infinite" }} /> : right}
      </div>
    </div>
  );
}

/* ----- FULL REPORT (designed in the same system) ----- */
const SECTIONS = [
  ["overview", "Обзор"], ["personality", "Личность"], ["emotions", "Эмоции"],
  ["relationships", "Отношения"], ["workAndMoney", "Работа"], ["strengths", "Сильные стороны"],
  ["growthZones", "Зоны роста"], ["recommendations", "Советы"],
];
function FullReportScreen({ params }) {
  const { state } = useStore();
  const { go, reset } = useRoute();
  const report = state.reports.find(r => r.id === params.id) || state.reports.find(r => r.isUnlocked);
  const refs = useRef({});
  const [active, setActive] = useState("overview");
  if (!report) return <EmptyState />;
  const b = report.birthData, full = report.fullReport;
  const scrollTo = (key) => { setActive(key); refs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <Screen>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textTransform: "uppercase" }}>Натальная карта</div>
      <h1 style={{ color: T.textPrimary, fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "6px 0 0" }}>{b.name}</h1>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6 }}>{b.birthDate} · {b.birthPlace}</div>
      {b.birthTimeAccuracy === "unknown" && (
        <div style={{ color: T.textTertiary, fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
          Без точного времени рождения — асцендент и дома могут быть неточными
        </div>
      )}

      {/* summary — glow card */}
      <div style={{ position: "relative", overflow: "hidden", background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 130, background: "radial-gradient(ellipse at center, rgba(110,90,235,0.42), rgba(110,90,235,0))", filter: "blur(18px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -30, left: -30, width: 150, height: 130, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.36), rgba(140,99,255,0))", filter: "blur(18px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>Коротко о тебе</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.5 }}>
          В твоей карте сочетаются устойчивость, чувствительность и сильная внутренняя концентрация. Ты можешь выглядеть спокойно, но внутри проживать всё глубже, чем показываешь.
        </div>
      </div>

      {/* chips nav (full-bleed scroll) */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 16px", margin: "0 -16px" }}>
        {SECTIONS.map(([key, label]) => (
          <button key={key} onClick={() => scrollTo(key)} style={{
            flexShrink: 0, height: 40, padding: "0 16px", borderRadius: 16, cursor: "pointer", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
            background: active === key ? T.white : T.surface, color: active === key ? "#000000" : "#FFFFFF",
            border: `1px solid ${active === key ? T.white : T.borderSubtle}`,
          }}>{label}</button>
        ))}
      </div>

      {SECTIONS.map(([key, label]) => (
        <div key={key} ref={el => (refs.current[key] = el)} style={{ scrollMarginTop: 12, paddingTop: 8 }}>
          <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, letterSpacing: "0.12px", margin: "10px 0 12px" }}>{label}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {full[key].map(item => (
              <div key={item.id} style={{ background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* bottom actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "24px 0 8px" }}>
        <button onClick={() => alert("Поделиться картой (mock)")} style={{ width: "100%", height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Share2 size={16} color="#FFFFFF" /> Поделиться картой
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => reset("enterName")} style={{ flex: 1, height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Новая карта</button>
          <button onClick={() => reset("main")} style={{ flex: 1, height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>На главную</button>
        </div>
      </div>
    </Screen>
  );
}

function MainScreen() {
  const { state } = useStore();
  const { go } = useRoute();
  const last = state.reports.find(r => r.id === state.lastOpenedReportId) || state.reports[0];
  const insight = last ? generateTodayInsight(last) : TODAY_INSIGHTS[0];
  const name = last?.birthData.name || state.birthData.name || "друг";
  return (
    <Screen>
      <h1 style={{ color: T.textPrimary, fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "4px 0 0" }}>Привет, {name}</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>
        Можно вернуться к готовому разбору или добавить новую карту
      </p>

      {/* Add card — #171717 with violet/blue glow blobs */}
      <div style={{ position: "relative", overflow: "hidden", background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "absolute", top: -50, right: -20, width: 220, height: 140, background: "radial-gradient(ellipse at center, rgba(80,105,235,0.5), rgba(80,105,235,0))", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 140, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.42), rgba(140,99,255,0))", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Добавить ментальную карту</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>Для себя, партнёра или человека, которого хочется понять чуть спокойнее</div>
        <button onClick={() => go("enterName")} style={{ position: "relative", width: "100%", height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Добавить</button>
      </div>

      {/* Insight card */}
      <div style={{ background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Сегодняшний инсайт</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{insight}</div>
      </div>

      {/* Tiles */}
      <div style={{ display: "flex", gap: 8 }}>
        <Tile icon={<Clock size={24} color="#FFFFFF" />} label="История" onClick={() => go("history")} />
        <Tile icon={<SettingsIcon size={24} color="#FFFFFF" />} label="Настройки" onClick={() => go("settings")} />
      </div>
    </Screen>
  );
}
function Tile({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: T.surface, border: "none", borderRadius: 16, padding: 16,
      textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
    }}>
      <div style={{ background: "#282828", borderRadius: 72, padding: 8, display: "flex" }}>{icon}</div>
      <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500 }}>{label}</div>
    </button>
  );
}

function HistoryScreen() {
  const { state } = useStore();
  const { go, back } = useRoute();
  return (
    <Screen>
      <div style={{ marginBottom: 8 }}><BackSquare onClick={back} /></div>
      <h1 style={{ color: T.textPrimary, fontSize: 27, fontWeight: 700, margin: "8px 0 0" }}>История отчётов</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.45, margin: "8px 0 22px" }}>
        Все созданные карты сохраняются локально в браузере
      </p>
      {state.reports.length === 0 ? (
        <EmptyState onCreate={() => go("enterName")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {state.reports.map(r => (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: T.textPrimary, fontSize: 19, fontWeight: 700 }}>{r.birthData.name}</div>
                  <div style={{ color: T.textSecondary, fontSize: 13.5, marginTop: 4 }}>{r.birthData.birthDate}</div>
                </div>
                <div style={{ background: T.badge, color: T.badgeText, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 14 }}>
                  {r.isUnlocked ? "Полный" : "Краткий"}
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <PrimaryButton onClick={() => go(r.isUnlocked ? "full" : "short", { id: r.id })}>Открыть</PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}

function EmptyState({ onCreate }) {
  const { go } = useRoute();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
      <BrandMark size={44} glow />
      <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 700, marginTop: 20 }}>Пока пусто</div>
      <div style={{ color: T.textSecondary, fontSize: 14, marginTop: 8, textAlign: "center", maxWidth: 260 }}>
        Создай первую натальную карту — она появится здесь.
      </div>
      <div style={{ marginTop: 20, width: 200 }}>
        <PrimaryButton onClick={() => (onCreate ? onCreate() : go("enterName"))}>Создать карту</PrimaryButton>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const { state, dispatch } = useStore();
  const { go, back, reset } = useRoute();
  const [confirm, setConfirm] = useState(false);
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{
      width: 46, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative",
      background: on ? T.white : T.surface2, transition: "background .2s",
    }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: "50%", background: on ? T.ink : "#6b6b72", transition: "left .2s" }} />
    </button>
  );
  const Row = ({ label, right, onClick }) => (
    <div onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderTop: `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default" }}>
      <span style={{ color: T.textPrimary, fontSize: 15 }}>{label}</span>{right}
    </div>
  );
  return (
    <Screen>
      <div style={{ marginBottom: 8 }}><BackSquare onClick={back} /></div>
      <h1 style={{ color: T.textPrimary, fontSize: 27, fontWeight: 700, margin: "8px 0 22px" }}>Настройки</h1>
      <Card style={{ padding: 4 }}>
        <Row label="История отчётов" right={<ChevronLeft size={18} color={T.textTertiary} style={{ transform: "rotate(180deg)" }} />} onClick={() => go("history")} />
        <Row label="Инсайт дня" right={<Toggle on={state.settings.insightOfDay} onClick={() => dispatch({ type: "UPDATE_SETTINGS", partial: { insightOfDay: !state.settings.insightOfDay } })} />} />
        <Row label="Новые функции" right={<Toggle on={state.settings.newFeatures} onClick={() => dispatch({ type: "UPDATE_SETTINGS", partial: { newFeatures: !state.settings.newFeatures } })} />} />
        <Row label="Восстановить покупки" right={<span style={{ color: T.textTertiary, fontSize: 13 }}>›</span>} onClick={() => alert("Покупки восстановлены (mock)")} />
        <Row label="Помощь" right={<span style={{ color: T.textTertiary, fontSize: 13 }}>›</span>} onClick={() => alert("Поддержка: support@example.com (mock)")} />
      </Card>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setConfirm(true)} style={{ width: "100%", height: 56, borderRadius: R.button, background: T.surface, border: `1px solid ${T.border}`, color: T.error, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Trash2 size={16} color={T.error} /> Удалить данные
        </button>
      </div>
      {confirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-end" }}>
          <div onClick={() => setConfirm(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div style={{ position: "relative", width: "100%", background: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: "24px 20px calc(24px + env(safe-area-inset-bottom))", animation: "slideUp .25s ease" }}>
            <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 700 }}>Удалить все данные?</div>
            <div style={{ color: T.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 1.45 }}>Все созданные карты и настройки будут стёрты. Это действие необратимо.</div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <SecondaryButton outlined onClick={() => setConfirm(false)}>Отмена</SecondaryButton>
              <button onClick={() => { dispatch({ type: "CLEAR_ALL" }); reset("start"); }} style={{ flex: 1, height: 56, borderRadius: R.button, background: T.error, border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}

/* ===================================== APP ROOT ===================================== */
const SCREENS = {
  start: StartScreen, enterName: EnterNameScreen, birthday: BirthdayScreen,
  timeBirth: TimeBirthScreen, check: CheckScreen, loading: LoadingScreen,
  short: ShortReportScreen, paywall: PaywallScreen, full: FullReportScreen,
  main: MainScreen, history: HistoryScreen, settings: SettingsScreen,
};

export default function NatalApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // router: entry depends on whether reports exist (mirrors "/" logic)
  const [stack, setStack] = useState([{ name: "start", params: {} }]);
  const current = stack[stack.length - 1];

  const go = useCallback((name, params = {}) => setStack(s => [...s, { name, params }]), []);
  const back = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const reset = useCallback((name, params = {}) => setStack([{ name, params }]), []);

  const router = useMemo(() => ({ go, back, reset, current }), [go, back, reset, current]);
  const ActiveScreen = SCREENS[current.name] || StartScreen;

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", justifyContent: "center", alignItems: "stretch", fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(233,233,233,0.5)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:none}}
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:0;background:transparent}
        button:active{transform:scale(.985)}
      `}</style>
      <div style={{
        width: "100%", maxWidth: 430, background: T.bg, position: "relative",
        height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <StoreCtx.Provider value={{ state, dispatch }}>
          <RouteCtx.Provider value={router}>
            <ActiveScreen params={current.params} />
            {/* dev: quick jump to Main when reports exist, like returning user */}
            {current.name === "start" && state.reports.length > 0 && (
              <button onClick={() => reset("main")} style={{ position: "absolute", top: 14, right: 14, background: T.surface, color: T.textSecondary, border: `1px solid ${T.border}`, borderRadius: 12, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                На главную →
              </button>
            )}
          </RouteCtx.Provider>
        </StoreCtx.Provider>
      </div>
    </div>
  );
}
