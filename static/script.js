function logDebug(message) {
  const debugBox = document.getElementById('debug');
  const entry = document.createElement('p');
  entry.innerText = message;
  debugBox.appendChild(entry);
}

logDebug("script.js is definitely running");

async function loadInbox() {
  logDebug('Loading emails...');

  const response = await fetch('/emails.json');
  let emails = await response.json();

  // === TEMP: Manual flag values ===
  const prioritize = true;
  const summaryEnabled = true;

  // === FUTURE: Uncomment when LaunchDarkly is enabled ===
  /*
  let prioritize = false;
  let summaryEnabled = false;

  try {
    prioritize = await ldClient.variation('smart-prioritization', false);
    summaryEnabled = await ldClient.variation('smart-summary', false);
    logDebug(`Flag values - Prioritize: ${prioritize}, Summary: ${summaryEnabled}`);
  } catch (e) {
    logDebug('LaunchDarkly flags not available, using defaults.');
  }
  */

  if (prioritize) {
    logDebug('Smart prioritization enabled — sorting emails...');
    emails.sort((a, b) => {
      const isAVIP = a.from.includes('vip') || a.from.includes('ceo');
      const isBVIP = b.from.includes('vip') || b.from.includes('ceo');
      return isBVIP - isAVIP;
    });
  }

  const inbox = document.getElementById('inbox');
  inbox.innerHTML = '';

  emails.forEach((email, i) => {
    const emailItem = document.createElement('div');
    emailItem.className = 'email';
    emailItem.innerHTML = `
      <h3>${email.subject}</h3>
      <p><strong>From:</strong> ${email.from}</p>
      <p>${email.body}</p>
      <div class="summary" id="summary-${i}"></div>
      <hr>
    `;
    inbox.appendChild(emailItem);
  });

  if (summaryEnabled) {
    applySummaries();
  }
}

function applySummaries() {
  const summaries = [
    "Client urgently needs contract renewal.",
    "Daily team notes and updates.",
    "Q2 productivity goals from leadership.",
    "General newsletter overview."
  ];

  document.querySelectorAll('.summary').forEach((el, i) => {
    el.innerHTML = `<em>Summary:</em> ${summaries[i] || "AI summary not available."}`;
  });

  logDebug('Summaries applied.');
}

function startDeepWork() {
  const sessionSelect = document.getElementById('sessionLength');
  let duration = parseInt(sessionSelect.value);

  const overlay = document.getElementById('deepWorkOverlay');
  const timerDisplay = document.getElementById('timerDisplay');
  const progressBar = document.getElementById('progressBar');

  const startTime = Date.now();
  localStorage.setItem('deepWorkActive', 'true');
  localStorage.setItem('deepWorkStart', startTime.toString());
  localStorage.setItem('deepWorkDuration', duration.toString());

  overlay.style.display = 'flex';
  updateDeepWorkTimer();

  let interval = setInterval(updateDeepWorkTimer, 1000);

  function updateDeepWorkTimer() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining >= 0) {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const progress = ((elapsed / duration) * 100);
      progressBar.style.width = `${progress}%`;
    }

    if (remaining <= 0) {
      clearInterval(interval);
      finishDeepWork();
    }
  }
}

function finishDeepWork() {
  const overlay = document.getElementById('deepWorkOverlay');
  const inbox = document.getElementById('inbox');

  localStorage.removeItem('deepWorkActive');
  localStorage.removeItem('deepWorkStart');
  localStorage.removeItem('deepWorkDuration');

  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.innerText = "Session Complete!";

  setTimeout(() => {
    overlay.style.display = 'none';
    loadInbox();
  }, 3000);
}

function checkDeepWorkState() {
  const deepWorkActive = localStorage.getItem('deepWorkActive');
  if (deepWorkActive === 'true') {
    resumeDeepWork();
  }
}

function resumeDeepWork() {
  const overlay = document.getElementById('deepWorkOverlay');
  const timerDisplay = document.getElementById('timerDisplay');
  const progressBar = document.getElementById('progressBar');

  const startTime = parseInt(localStorage.getItem('deepWorkStart'));
  const duration = parseInt(localStorage.getItem('deepWorkDuration'));

  overlay.style.display = 'flex';

  function updateDeepWorkTimer() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining >= 0) {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const progress = ((elapsed / duration) * 100);
      progressBar.style.width = `${progress}%`;
    }

    if (remaining <= 0) {
      clearInterval(interval);
      finishDeepWork();
    }
  }

  let interval = setInterval(updateDeepWorkTimer, 1000);
}

// === LaunchDarkly fallback ===
if (localStorage.getItem('deepWorkActive') !== 'true') {
  loadInbox();
}

// Always check for resumed Deep Work
checkDeepWorkState();

// === LaunchDarkly real usage (enable when TO is ready) ===
/*
ldClient.on('ready', () => {
  logDebug('LaunchDarkly is ready');
  loadInbox();
});
*/