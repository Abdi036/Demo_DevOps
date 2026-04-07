const STORAGE_KEY = "mission-control-state-v1";

const env = document.getElementById("environment");
const complexity = document.getElementById("complexity");
const complexityLabel = document.getElementById("complexityLabel");
const chaosMode = document.getElementById("chaosMode");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const pipelineFill = document.getElementById("pipelineFill");
const statusText = document.getElementById("statusText");

const totalRunsEl = document.getElementById("totalRuns");
const successRateEl = document.getElementById("successRate");
const streakEl = document.getElementById("streak");
const missionScoreEl = document.getElementById("missionScore");
const reliabilityTag = document.getElementById("reliabilityTag");
const historyList = document.getElementById("historyList");

const riskLabels = {
  1: "1 - Tiny Change",
  2: "2 - Low Risk",
  3: "3 - Medium Risk",
  4: "4 - High Risk",
  5: "5 - Critical Change",
};

const envPenalty = {
  dev: 0,
  staging: 0.06,
  prod: 0.12,
};

const stages = [
  "Running tests",
  "Building artifacts",
  "Scanning security",
  "Deploying service",
  "Validating health checks",
];

const defaultState = {
  runs: 0,
  successes: 0,
  failures: 0,
  streak: 0,
  bestStreak: 0,
  missionScore: 0,
  history: [],
};

let state = loadState();
let busy = false;

complexity.addEventListener("input", updateComplexityLabel);
runBtn.addEventListener("click", runPipeline);
resetBtn.addEventListener("click", resetState);

updateComplexityLabel();
render();

function updateComplexityLabel() {
  complexityLabel.textContent = riskLabels[Number(complexity.value)];
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(saved);
    return {
      ...defaultState,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 8) : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSuccessChance() {
  const base = 0.92;
  const complexityPenalty = Number(complexity.value) * 0.08;
  const chaosPenalty = chaosMode.checked ? 0.18 : 0;
  const raw = base - complexityPenalty - envPenalty[env.value] - chaosPenalty;
  return Math.min(0.95, Math.max(0.2, raw));
}

function setStatus(message, tone = "neutral") {
  statusText.textContent = message;
  if (tone === "success") {
    statusText.className = "ok";
  } else if (tone === "error") {
    statusText.className = "fail";
  } else {
    statusText.className = "";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPipeline() {
  if (busy) {
    return;
  }

  busy = true;
  runBtn.disabled = true;
  resetBtn.disabled = true;
  pipelineFill.style.width = "0%";
  pipelineFill.style.background = "linear-gradient(90deg, #22d3ee, #10b981)";

  const chance = getSuccessChance();

  for (let i = 0; i < stages.length; i += 1) {
    const pct = Math.round(((i + 1) / stages.length) * 100);
    setStatus(`${stages[i]}...`);
    pipelineFill.style.width = `${pct}%`;
    await sleep(350 + Number(complexity.value) * 120);
  }

  const success = Math.random() < chance;
  const scoreDelta = success
    ? (chaosMode.checked ? 24 : 14) - Number(complexity.value)
    : -6;

  state.runs += 1;
  state.missionScore = Math.max(0, state.missionScore + scoreDelta);

  if (success) {
    state.successes += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    setStatus("Pipeline completed successfully.", "success");
  } else {
    state.failures += 1;
    state.streak = 0;
    pipelineFill.style.background = "linear-gradient(90deg, #fb7185, #f43f5e)";
    setStatus("Deployment failed during verification.", "error");
  }

  state.history.unshift({
    id: crypto.randomUUID(),
    environment: env.value,
    complexity: Number(complexity.value),
    chaos: chaosMode.checked,
    success,
    at: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  state.history = state.history.slice(0, 8);

  saveState();
  render();

  busy = false;
  runBtn.disabled = false;
  resetBtn.disabled = false;
}

function getReliabilityTier() {
  if (state.runs < 3) {
    return "Cold Start";
  }

  const rate = state.successes / state.runs;
  if (rate >= 0.85) {
    return "Elite Reliability";
  }
  if (rate >= 0.65) {
    return "Stable";
  }
  if (rate >= 0.45) {
    return "Needs Attention";
  }
  return "Critical";
}

function render() {
  totalRunsEl.textContent = String(state.runs);

  const successRate = state.runs
    ? Math.round((state.successes / state.runs) * 100)
    : 0;
  successRateEl.textContent = `${successRate}%`;
  streakEl.textContent = `${state.streak} (best ${state.bestStreak})`;
  missionScoreEl.textContent = String(state.missionScore);
  reliabilityTag.textContent = getReliabilityTier();

  if (state.history.length === 0) {
    historyList.innerHTML =
      '<li class="empty">No runs yet. Launch one to generate telemetry.</li>';
    return;
  }

  historyList.innerHTML = state.history
    .map((entry) => {
      const outcome = entry.success ? "SUCCESS" : "FAILED";
      const klass = entry.success ? "ok" : "fail";
      const mode = entry.chaos ? "Chaos" : "Normal";
      return `
        <li>
          <span>${entry.at} | ${entry.environment.toUpperCase()} | C${entry.complexity} | ${mode}</span>
          <strong class="${klass}">${outcome}</strong>
        </li>
      `;
    })
    .join("");
}

function resetState() {
  if (busy) {
    return;
  }

  state = { ...defaultState };
  saveState();
  pipelineFill.style.width = "0%";
  pipelineFill.style.background = "linear-gradient(90deg, #22d3ee, #10b981)";
  setStatus("Stats reset. Ready for a fresh launch.");
  render();
}
