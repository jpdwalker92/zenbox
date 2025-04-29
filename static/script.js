// Function to print debug messages visibly on the page
function logDebug(message) {
  const debugBox = document.getElementById('debug');
  const entry = document.createElement('p');
  entry.innerText = message;
  debugBox.appendChild(entry);
}

// ✅ Confirm script is running
logDebug("✅ script.js is definitely running");

// ✅ Load emails and render inbox
async function loadInbox() {
  logDebug('Loading emails...');

  const response = await fetch('/emails.json');
  let emails = await response.json();

  // Simulate flag values manually (no LaunchDarkly)
  const prioritize = true;
  const summaryEnabled = true;

  if (prioritize) {
    logDebug('✅ Smart prioritization enabled — sorting emails...');
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

// ✅ Fake AI Summarization
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

  logDebug('✅ Summaries applied.');
}

// ✅ Deep Work Mode
function startDeepWork() {
  const inbox = document.getElementById('inbox');
  inbox.innerHTML = '<h2>Deep Work Mode Enabled</h2>';

  let duration = 10; // 10 seconds for demo
  const timerDisplay = document.getElementById('timer');

  const interval = setInterval(() => {
    duration--;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    timerDisplay.innerText = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (duration <= 0) {
      clearInterval(interval);
      timerDisplay.innerText = '';
      loadInbox(); // Reload inbox after deep work
    }
  }, 1000);
}

// ✅ Kick off
loadInbox();