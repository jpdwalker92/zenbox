function logDebug(message) {
  const debugBox = document.getElementById('debug');
  const entry = document.createElement('p');
  entry.innerText = message;
  debugBox.appendChild(entry);
}

logDebug("script.js is definitely running");

let currentEmails = [];
let currentSummaries = [];
let prioritized = false;

// Feature flag fallbacks (simulating LaunchDarkly)
let prioritizationFlagEnabled = true;
let summaryFlagEnabled = true;

async function loadInbox() {
  logDebug('Loading inbox data...');

  try {
    const emailsResponse = await fetch('/emails.json'); // fixed path
    const summariesResponse = await fetch('/summaries.json'); // fixed path
    currentEmails = await emailsResponse.json();
    currentSummaries = await summariesResponse.json();
    logDebug('✅ Fetched emails and summaries');
  } catch (error) {
    logDebug('❌ Failed to fetch emails or summaries');
    return;
  }

  const button = document.getElementById('prioritizeButton');
  if (prioritizationFlagEnabled) {
    button.style.display = 'inline-block';
  } else {
    button.style.display = 'none';
  }

  renderInbox();
}

function renderInbox() {
  const inbox = document.getElementById('inbox');
  inbox.innerHTML = '';

  if (!currentEmails.length) {
    inbox.innerHTML = '<p>No emails loaded.</p>';
    return;
  }

  let emailsToDisplay = [...currentEmails];

  if (prioritized && prioritizationFlagEnabled) {
    logDebug('Smart Prioritization enabled — VIPs sorted to top.');
    emailsToDisplay.sort((a, b) => {
      const isAVIP = a.from.includes('vip') || a.from.includes('ceo');
      const isBVIP = b.from.includes('vip') || b.from.includes('ceo');
      return isBVIP - isAVIP;
    });
  } else {
    logDebug('Sorted by most recent date');
    emailsToDisplay.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  emailsToDisplay.forEach((email, i) => {
    const emailItem = document.createElement('div');
    emailItem.className = 'email';
    emailItem.innerHTML = `
      <h3>${email.subject}</h3>
      <p><strong>From:</strong> ${email.from}</p>
      <p><strong>Date:</strong> ${new Date(email.date).toLocaleString()}</p>
      <p>${email.body}</p>
      <div class="summary" id="summary-${i}"></div>
      <hr>
    `;
    inbox.appendChild(emailItem);
  });

  if (summaryFlagEnabled) {
    applySummaries(currentSummaries);
  }
}

function applySummaries(summaries) {
  document.querySelectorAll('.summary').forEach((el, i) => {
    el.innerHTML = `<em>Summary:</em> ${summaries[i] || "AI summary not available."}`;
  });
  logDebug('✅ Summaries applied.');
}

function togglePrioritization() {
  if (!prioritizationFlagEnabled) return;
  prioritized = !prioritized;
  logDebug(prioritized ? 'Switched to prioritized mode' : 'Switched to chronological mode');
  renderInbox();
}

// === Deep Work Mode ===
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
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.innerText = "Session Complete!";

  localStorage.removeItem('deepWorkActive');
  localStorage.removeItem('deepWorkStart');
  localStorage.removeItem('deepWorkDuration');

  setTimeout(() => {
    overlay.style.display = 'none';
    renderInbox();
  }, 3000);
}

function checkDeepWorkState() {
  if (localStorage.getItem('deepWorkActive') === 'true') {
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

// === Startup ===
loadInbox();
checkDeepWorkState();