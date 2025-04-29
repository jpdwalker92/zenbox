function logDebug(message) {
  const debugBox = document.getElementById('debug');
  const entry = document.createElement('p');
  entry.innerText = message;
  debugBox.appendChild(entry);
}

// Now use logDebug() instead of console.log
logDebug('✅ ld-config.js loaded!');
logDebug('Trying to initialize LaunchDarkly...');

const LD_CLIENT_ID = '67fe704d1acad60d5d7e2846'; // your real key

const userContext = {
  kind: 'user',
  key: 'alice@zenbox.com',
  name: 'Alice',
  plan: 'pro',
  beta: true
};

const ldOptions = {
  bootstrap: 'localStorage',
  sendEvents: true,
  streaming: true,
  logger: console
};

const ldClient = LaunchDarkly.initialize(LD_CLIENT_ID, userContext, ldOptions);

logDebug('✅ ldClient object created: ' + JSON.stringify(ldClient));