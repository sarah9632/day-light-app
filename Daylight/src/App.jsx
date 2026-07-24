import React, { useState, useEffect, useRef, useMemo } from "react";

// ---------- Design tokens ----------
// bg: #14161F | elevated: #1D2130 | gold(sun): #F5B942
// green(نجاح): #5FD98A | coral(لسه): #F0705C | text: #F3F1EA | muted: #8891A6

const FONT_LINK_ID = "daylight-fonts";
const ANIM_STYLE_ID = "daylight-anim";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;900&family=Tajawal:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

function useAnimStyles() {
  useEffect(() => {
    if (document.getElementById(ANIM_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = ANIM_STYLE_ID;
    style.textContent = `
      @keyframes dl-pop {
        0% { transform: scale(0.85); }
        55% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }
      @keyframes dl-burst {
        0% { transform: translate(0,0) scale(1); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
      }
      @keyframes dl-breathe {
        0%, 100% { box-shadow: 0 0 14px rgba(245,185,66,0.35), 0 0 0 0 rgba(245,185,66,0.25); }
        50% { box-shadow: 0 0 26px rgba(245,185,66,0.55), 0 0 0 8px rgba(245,185,66,0.08); }
      }
      @keyframes dl-flame {
        0%, 100% { transform: translateY(0) rotate(-2deg); }
        50% { transform: translateY(-3px) rotate(2deg); }
      }
      @keyframes dl-riseText {
        0% { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .dl-pop { animation: dl-pop .35s cubic-bezier(.34,1.56,.64,1); }
      .dl-breathe { animation: dl-breathe 2.6s ease-in-out infinite; }
      .dl-flame { display: inline-block; animation: dl-flame 1.4s ease-in-out infinite; }
      .dl-rise { animation: dl-riseText .35s ease-out; }
    `;
    document.head.appendChild(style);
  }, []);
}

const GREEN_LINES = [
  "يومك اتلوّن أخضر ✨",
  "كده! خطوة كمان اتحطت",
  "الاستمرارية دي هي السر",
  "شمعة ضو تانية في مسارك",
  "برافو، كملها بكرة كمان",
  "يوم صغير، فرق كبير",
];
const RED_LINES = [
  "مفيش يوم مثالي، وده طبيعي",
  "المهم إنك رجعت تسجّل بصراحة",
  "بكرة يوم جديد يا بطل",
  "التسجيل بصراحة نفسه إنجاز",
  "خد نفس، وكمّل تاني بكرة",
];

function pickLine(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Burst({ color }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => ({
        dx: Math.round(Math.cos(Math.random() * Math.PI * 2) * (40 + Math.random() * 50)),
        dy: Math.round(Math.sin(Math.random() * Math.PI * 2) * (40 + Math.random() * 50)),
        delay: Math.random() * 0.12,
        size: 4 + Math.random() * 5,
      })),
    []
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animation: `dl-burst .6s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const dayLabel = (key) => {
  const d = new Date(key);
  return d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" });
};

// ---------- Storage helpers (persistent, per-user, plain localStorage) ----------
async function loadProfile() {
  try {
    const v = localStorage.getItem("daylight:profile");
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
async function saveProfile(p) {
  try {
    localStorage.setItem("daylight:profile", JSON.stringify(p));
  } catch {}
}
async function loadDays() {
  try {
    const v = localStorage.getItem("daylight:days");
    return v ? JSON.parse(v) : {};
  } catch {
    return {};
  }
}
async function saveDays(days) {
  try {
    localStorage.setItem("daylight:days", JSON.stringify(days));
  } catch {}
}

// ---------- Small UI atoms ----------
function Orb({ status, size = 34, active = false }) {
  const bg =
    status === "green"
      ? "radial-gradient(circle at 32% 28%, #A8F5C4, #5FD98A 65%, #2FA968 100%)"
      : status === "red"
      ? "radial-gradient(circle at 32% 28%, #FFC0B4, #F0705C 65%, #C24C3B 100%)"
      : "#3A3F52";
  const glow =
    status === "green"
      ? "0 0 14px rgba(95,217,138,0.55)"
      : status === "red"
      ? "0 0 14px rgba(240,112,92,0.5)"
      : "none";
  return (
    <div
      className={active ? "dl-breathe" : ""}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        boxShadow: active ? undefined : glow,
        flexShrink: 0,
        transition: "background .3s ease",
      }}
    />
  );
}

function PrimaryButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Cairo, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        color: "#14161F",
        background: "linear-gradient(135deg, #F5B942, #F0985A)",
        border: "none",
        borderRadius: 14,
        padding: "14px 22px",
        cursor: "pointer",
        width: "100%",
        boxShadow: "0 6px 18px rgba(245,185,66,0.25)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Tajawal, sans-serif",
        fontWeight: 500,
        fontSize: 15,
        color: "#8891A6",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "13px 22px",
        cursor: "pointer",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#1D2130",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 22,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      dir="rtl"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        background: "#14161F",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        color: "#F3F1EA",
        fontFamily: "Tajawal, sans-serif",
        fontSize: 15,
        padding: 14,
        resize: "none",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

// ---------- Screens ----------

function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("21:00");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, height: "100%" }}>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            margin: "0 auto 18px",
            background: "radial-gradient(circle at 35% 30%, #FFE7A8, #F5B942 55%, #F0705C 100%)",
            boxShadow: "0 0 40px rgba(245,185,66,0.4)",
          }}
        />
        <h1
          style={{
            fontFamily: "Cairo, sans-serif",
            color: "#F3F1EA",
            fontSize: 26,
            fontWeight: 900,
            margin: 0,
          }}
        >
          Day Light
        </h1>
        <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", marginTop: 8, fontSize: 14.5 }}>
          كل يوم نقطة ضوء… لونها إنت اللي بتحددها
        </p>
      </div>

      <Card>
        <label style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13.5 }}>
          اسمك
        </label>
        <input
          dir="rtl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك"
          style={{
            width: "100%",
            marginTop: 8,
            background: "#14161F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#F3F1EA",
            fontFamily: "Tajawal, sans-serif",
            fontSize: 15,
            padding: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13.5, marginTop: 16, display: "block" }}>
          إشعار المراجعة اليومية
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            width: "100%",
            marginTop: 8,
            background: "#14161F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#F3F1EA",
            fontFamily: "Tajawal, sans-serif",
            fontSize: 15,
            padding: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <p style={{ color: "#5A6178", fontSize: 12, fontFamily: "Tajawal, sans-serif", marginTop: 8 }}>
          هنفكرك في المعاد ده كل يوم تقيّم يومك
        </p>
      </Card>

      <div style={{ marginTop: "auto" }}>
        <PrimaryButton
          onClick={() => name.trim() && onDone({ name: name.trim(), time })}
        >
          يلا نبدأ
        </PrimaryButton>
      </div>
    </div>
  );
}

function calcStreak(days) {
  let streak = 0;
  const d = new Date();
  // if today isn't logged yet, start counting from yesterday
  if (!days[todayKey()] || days[todayKey()].status !== "green") {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    if (days[key] && days[key].status === "green") {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function Home({ profile, days, onNewDay, onReview }) {
  const keys = Object.keys(days).sort();
  const last7 = keys.slice(-7);
  const greenCount = keys.filter((k) => days[k].status === "green").length;
  const already = days[todayKey()];
  const streak = calcStreak(days);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      <div>
        <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 14, margin: 0 }}>
          أهلاً بيك تاني
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 24, margin: 0 }}>
            {profile.name} 👋
          </h2>
          {streak >= 2 && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(245,185,66,0.12)",
                border: "1px solid rgba(245,185,66,0.35)",
                borderRadius: 999,
                padding: "3px 10px",
                color: "#F5B942",
                fontFamily: "Cairo, sans-serif",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span className="dl-flame">🔥</span>
              {streak}
            </span>
          )}
        </div>
      </div>

      <Card>
        <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, margin: "0 0 12px" }}>
          مسار آخر ٧ أيام
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: last7.length ? "flex-start" : "center" }}>
          {last7.length === 0 && (
            <span style={{ color: "#5A6178", fontFamily: "Tajawal, sans-serif", fontSize: 13 }}>
              لسه مفيش أيام متسجلة
            </span>
          )}
          {last7.map((k) => (
            <Orb key={k} status={days[k].status} size={28} active={k === todayKey()} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <span style={{ color: "#5FD98A", fontFamily: "Tajawal, sans-serif", fontSize: 13, fontWeight: 700 }}>
            {greenCount} يوم أخضر
          </span>
          <span style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13 }}>
            من {keys.length} يوم
          </span>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
        <PrimaryButton onClick={onNewDay}>
          {already ? "عدّل يوم النهاردة" : "سجّل يوم النهاردة"}
        </PrimaryButton>
        <GhostButton onClick={onReview}>راجع الأيام اللي فاتت</GhostButton>
      </div>
    </div>
  );
}

function CheckIn({ onSave, onCancel }) {
  const [status, setStatus] = useState(null);
  const [achievement, setAchievement] = useState("");
  const [burstKey, setBurstKey] = useState(0);
  const line = useMemo(
    () => (status === "green" ? pickLine(GREEN_LINES) : status === "red" ? pickLine(RED_LINES) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );

  const choose = (val) => {
    setStatus(val);
    setBurstKey((k) => k + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, height: "100%" }}>
      <div>
        <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, margin: 0 }}>
          {dayLabel(todayKey())}
        </p>
        <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 22, margin: "6px 0 0" }}>
          حققت هدفك النهاردة؟
        </h2>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <button
          key={`g-${burstKey}-${status}`}
          onClick={() => choose("green")}
          className={status === "green" ? "dl-pop" : ""}
          style={{
            position: "relative",
            flex: 1,
            padding: "22px 0",
            borderRadius: 18,
            border: status === "green" ? "2px solid #5FD98A" : "1px solid rgba(255,255,255,0.08)",
            background: status === "green" ? "rgba(95,217,138,0.14)" : "#1D2130",
            cursor: "pointer",
            overflow: "visible",
          }}
        >
          {status === "green" && <Burst color="#5FD98A" />}
          <Orb status="green" size={40} active={status === "green"} />
          <p style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", marginTop: 10, fontSize: 15 }}>
            أيوه، حققته
          </p>
        </button>
        <button
          key={`r-${burstKey}-${status}`}
          onClick={() => choose("red")}
          className={status === "red" ? "dl-pop" : ""}
          style={{
            position: "relative",
            flex: 1,
            padding: "22px 0",
            borderRadius: 18,
            border: status === "red" ? "2px solid #F0705C" : "1px solid rgba(255,255,255,0.08)",
            background: status === "red" ? "rgba(240,112,92,0.14)" : "#1D2130",
            cursor: "pointer",
            overflow: "visible",
          }}
        >
          {status === "red" && <Burst color="#F0705C" />}
          <Orb status="red" size={40} active={status === "red"} />
          <p style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", marginTop: 10, fontSize: 15 }}>
            لسه
          </p>
        </button>
      </div>

      {status && (
        <p
          key={burstKey}
          className="dl-rise"
          style={{
            textAlign: "center",
            color: status === "green" ? "#5FD98A" : "#F0705C",
            fontFamily: "Tajawal, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {line}
        </p>
      )}

      {status === "green" && (
        <Card>
          <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, marginTop: 0 }}>
            حابب تسجل انجازك؟ (اختياري)
          </p>
          <TextArea value={achievement} onChange={setAchievement} placeholder="مثلاً: خلصت المذاكرة اللي كنت مأجلها" />
        </Card>
      )}

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton
          onClick={() => {
            if (!status) return;
            if (status === "green") onSave({ status: "green", achievement });
            else onSave({ status: "pending-problem" });
          }}
          style={{ opacity: status ? 1 : 0.5, pointerEvents: status ? "auto" : "none" }}
        >
          {status === "red" ? "التالي" : "حفظ اليوم"}
        </PrimaryButton>
        <GhostButton onClick={onCancel}>رجوع</GhostButton>
      </div>
    </div>
  );
}

function ProblemStep({ onNext, onSkip }) {
  const [problem, setProblem] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      <div>
        <p style={{ color: "#F0705C", fontFamily: "Tajawal, sans-serif", fontSize: 13, fontWeight: 700, margin: 0 }}>
          معلش، بكرة أحسن
        </p>
        <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 21, margin: "6px 0 0" }}>
          إيه اللي وقف قدامك النهاردة؟
        </h2>
        <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13.5, marginTop: 6 }}>
          اكتب المشكلة بصراحة، ده هيساعدك تلاقي حل أسرع
        </p>
      </div>

      <Card>
        <TextArea value={problem} onChange={setProblem} placeholder="مثلاً: مكنش عندي وقت، تعبت، نسيت، حصل ظرف مفاجئ..." />
      </Card>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton onClick={() => onNext(problem)}>التالي</PrimaryButton>
        <GhostButton onClick={onSkip}>تخطي، مش عايز أكتب المشكلة</GhostButton>
      </div>
    </div>
  );
}

function SolutionChoice({ problem, onChoose, onSkip }) {
  const options = [
    { id: "ask", title: "أسأل حد", desc: "شارك المشكلة مع صاحبك، أهلك، أو حد بتثق فيه" },
    { id: "self", title: "أحلها بنفسي", desc: "هتحط خطوة بسيطة تعملها بكرة" },
    { id: "custom", title: "أكتب الحل بنفسي", desc: "عندك حل جاهز في دماغك؟ اكتبه بالتفصيل" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
      <div>
        <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 21, margin: 0 }}>
          طيب، هتتعامل مع الموضوع ده إزاي؟
        </h2>
        {problem ? (
          <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, marginTop: 8 }}>
            "{problem}"
          </p>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChoose(o.id)}
            style={{
              textAlign: "right",
              background: "#1D2130",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
              cursor: "pointer",
            }}
          >
            <p style={{ color: "#F5B942", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 15.5, margin: 0 }}>
              {o.title}
            </p>
            <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, margin: "6px 0 0" }}>
              {o.desc}
            </p>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <GhostButton onClick={onSkip}>تخطي، هفكر فيها بعدين</GhostButton>
      </div>
    </div>
  );
}

function SolutionDetail({ type, onSave, onSkip }) {
  const [text, setText] = useState("");
  const meta = {
    ask: { title: "هتسأل مين؟", ph: "اكتب اسم الشخص أو حتى إيه اللي هتسأله عنه" },
    self: { title: "خطوتك الجاية إيه؟", ph: "مثلاً: هظبط منبه بدري بربع ساعة بكرة" },
    custom: { title: "اكتب حلك", ph: "اكتب الحل اللي في دماغك بالتفصيل" },
  }[type];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 21, margin: 0 }}>
        {meta.title}
      </h2>
      <Card>
        <TextArea value={text} onChange={setText} placeholder={meta.ph} />
      </Card>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton onClick={() => onSave(text)}>حفظ اليوم</PrimaryButton>
        <GhostButton onClick={onSkip}>تخطي، احفظ من غير التفاصيل دي</GhostButton>
      </div>
    </div>
  );
}

function History({ days, onOpenDay, onBack }) {
  const keys = Object.keys(days).sort().reverse();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 21, margin: 0 }}>
        الأيام اللي فاتت
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
        {keys.length === 0 && (
          <p style={{ color: "#5A6178", fontFamily: "Tajawal, sans-serif", fontSize: 14, textAlign: "center", marginTop: 30 }}>
            لسه مفيش أيام مسجلة
          </p>
        )}
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => onOpenDay(k)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#1D2130",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "12px 16px",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            <Orb status={days[k].status} size={22} />
            <div style={{ flex: 1 }}>
              <p style={{ color: "#F3F1EA", fontFamily: "Tajawal, sans-serif", fontSize: 14, margin: 0 }}>
                {dayLabel(k)}
              </p>
              <p style={{ color: "#5A6178", fontFamily: "Tajawal, sans-serif", fontSize: 12, margin: "3px 0 0" }}>
                {days[k].status === "green" ? days[k].achievement || "تم بدون تفاصيل" : days[k].problem || "لسه، بدون تفاصيل"}
              </p>
            </div>
          </button>
        ))}
      </div>
      <GhostButton onClick={onBack}>رجوع للرئيسية</GhostButton>
    </div>
  );
}

function DayDetail({ dayKey, day, onBack }) {
  const solutionLabel = { ask: "هيسأل حد", self: "هيحلها بنفسه", custom: "كتب حل بنفسه" }[day.solutionType];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Orb status={day.status} size={30} />
        <h2 style={{ color: "#F3F1EA", fontFamily: "Cairo, sans-serif", fontSize: 19, margin: 0 }}>
          {dayLabel(dayKey)}
        </h2>
      </div>

      {day.status === "green" ? (
        <Card>
          <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, marginTop: 0 }}>الإنجاز</p>
          <p style={{ color: "#F3F1EA", fontFamily: "Tajawal, sans-serif", fontSize: 15 }}>
            {day.achievement || "متسجلش تفاصيل"}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", fontSize: 13, marginTop: 0 }}>المشكلة</p>
            <p style={{ color: "#F3F1EA", fontFamily: "Tajawal, sans-serif", fontSize: 15 }}>
              {day.problem || "متسجلش تفاصيل"}
            </p>
          </Card>
          {day.solutionType && (
            <Card>
              <p style={{ color: "#F5B942", fontFamily: "Tajawal, sans-serif", fontSize: 13, marginTop: 0, fontWeight: 700 }}>
                {solutionLabel}
              </p>
              <p style={{ color: "#F3F1EA", fontFamily: "Tajawal, sans-serif", fontSize: 15 }}>
                {day.solutionText || "متسجلش تفاصيل"}
              </p>
            </Card>
          )}
        </>
      )}
      <div style={{ marginTop: "auto" }}>
        <GhostButton onClick={onBack}>رجوع</GhostButton>
      </div>
    </div>
  );
}

// ---------- Root ----------
export default function DayLightApp() {
  useFonts();
  useAnimStyles();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState({});
  const [screen, setScreen] = useState("loading");
  const draft = useRef({});
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      const d = await loadDays();
      setProfile(p);
      setDays(d);
      setScreen(p ? "home" : "onboarding");
      setReady(true);
    })();
  }, []);

  const persistDay = async (entry) => {
    const updated = { ...days, [todayKey()]: entry };
    setDays(updated);
    await saveDays(updated);
    setScreen("home");
  };

  if (!ready) {
    return (
      <div style={wrapStyle}>
        <div style={innerStyle}>
          <p style={{ color: "#8891A6", fontFamily: "Tajawal, sans-serif", textAlign: "center", marginTop: 100 }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle} dir="rtl">
      <div style={innerStyle}>
        {screen === "onboarding" && (
          <Onboarding
            onDone={async (p) => {
              setProfile(p);
              await saveProfile(p);
              setScreen("home");
            }}
          />
        )}

        {screen === "home" && profile && (
          <Home
            profile={profile}
            days={days}
            onNewDay={() => setScreen("checkin")}
            onReview={() => setScreen("history")}
          />
        )}

        {screen === "checkin" && (
          <CheckIn
            onCancel={() => setScreen("home")}
            onSave={(res) => {
              if (res.status === "green") {
                persistDay({ status: "green", achievement: res.achievement });
              } else {
                draft.current = {};
                setScreen("problem");
              }
            }}
          />
        )}

        {screen === "problem" && (
          <ProblemStep
            onNext={(problem) => {
              draft.current.problem = problem;
              setScreen("solutionChoice");
            }}
            onSkip={() => {
              draft.current.problem = "";
              setScreen("solutionChoice");
            }}
          />
        )}

        {screen === "solutionChoice" && (
          <SolutionChoice
            problem={draft.current.problem}
            onChoose={(type) => {
              draft.current.solutionType = type;
              setScreen("solutionDetail");
            }}
            onSkip={() => persistDay({ status: "red", problem: draft.current.problem })}
          />
        )}

        {screen === "solutionDetail" && (
          <SolutionDetail
            type={draft.current.solutionType}
            onSave={(text) =>
              persistDay({
                status: "red",
                problem: draft.current.problem,
                solutionType: draft.current.solutionType,
                solutionText: text,
              })
            }
            onSkip={() =>
              persistDay({
                status: "red",
                problem: draft.current.problem,
                solutionType: draft.current.solutionType,
                solutionText: "",
              })
            }
          />
        )}

        {screen === "history" && (
          <History
            days={days}
            onBack={() => setScreen("home")}
            onOpenDay={(k) => {
              setSelectedDay(k);
              setScreen("dayDetail");
            }}
          />
        )}

        {screen === "dayDetail" && selectedDay && (
          <DayDetail dayKey={selectedDay} day={days[selectedDay]} onBack={() => setScreen("history")} />
        )}
      </div>
    </div>
  );
}

const wrapStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 50% -10%, #232840 0%, #14161F 55%)",
  display: "flex",
  justifyContent: "center",
  padding: "24px 14px",
  boxSizing: "border-box",
};

const innerStyle = {
  width: "100%",
  maxWidth: 400,
  minHeight: "88vh",
  boxSizing: "border-box",
};
