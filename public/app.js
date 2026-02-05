const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const quickStress = document.getElementById('quick-stress');
const assessmentSuggestion = document.getElementById('assessment-suggestion');
const suggestionMessage = document.getElementById('suggestion-message');
const suggestionActions = document.getElementById('suggestion-actions');
const assessmentShell = document.getElementById('assessment-shell');
const assessmentDrawer = document.getElementById('assessment-drawer');
const assessmentDock = document.getElementById('assessment-dock');
const closeAssessments = document.getElementById('close-assessments');
const libraryGrid = document.getElementById('library-grid');
const personalizedForm = document.getElementById('personalized-form');
const personalizedOutput = document.getElementById('personalized-output');
const metricsGrid = document.getElementById('metrics-grid');
const safetyModal = document.getElementById('safety-modal');
const openSafety = document.getElementById('open-safety');
const closeSafety = document.getElementById('close-safety');
const startCheckin = document.getElementById('start-checkin');

const API = {
  chat: '/chat',
  stats: '/chat/stats',
  library: '/suggestions/library',
  personalized: '/suggestions/personalized'
};

const createMessage = (text, role = 'assistant') => {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const createCrisisCard = emergency => {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.innerHTML = `
    <strong>${emergency.message}</strong>
    <ul>${(emergency.contacts || [])
      .map(contact => `<li>${contact.name} — ${contact.phone} (${contact.availability})</li>`)
      .join('')}</ul>
  `;
  chatWindow.appendChild(card);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const toggleAssessmentDrawer = show => {
  assessmentDrawer.hidden = !show;
};

const renderSuggestionButtons = options => {
  suggestionActions.innerHTML = '';
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'ghost-button';
    button.type = 'button';
    button.textContent = option.label;
    button.addEventListener('click', () => startAssessment(option.type));
    suggestionActions.appendChild(button);
  });
  assessmentSuggestion.hidden = false;
};

const startAssessment = async type => {
  assessmentSuggestion.hidden = true;
  toggleAssessmentDrawer(true);
  const response = await fetch(API.chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'start_assessment', type })
  });
  if (!response.ok) {
    createMessage('Unable to load assessment. Please try again later.');
    return;
  }
  const data = await response.json();
  renderAssessmentForm(data);
};

const renderAssessmentForm = data => {
  assessmentShell.innerHTML = '';
  const assessment = data.questions || {};
  const items = Array.isArray(assessment) ? assessment : assessment.items || [];
  const title = document.createElement('h3');
  title.textContent = assessment.title || data.type.toUpperCase();
  const scale = document.createElement('p');
  if (assessment.scale) {
    scale.textContent = `Scale: ${assessment.scale}`;
  }

  const form = document.createElement('form');
  form.className = 'assessment-form';

  items.forEach((question, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'question-card';

    const label = document.createElement('p');
    label.textContent = `${index + 1}. ${question}`;

    const select = document.createElement('select');
    select.name = String(index);
    ['0', '1', '2', '3'].forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    form.appendChild(wrapper);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button';
  submit.textContent = 'Submit Assessment';

  const result = document.createElement('div');
  result.className = 'question-card';

  form.appendChild(submit);
  form.appendChild(result);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const answers = {};
    formData.forEach((value, key) => {
      if (key !== '') {
        answers[key] = Number(value);
      }
    });
    const response = await fetch(API.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit_assessment', type: data.type, answers })
    });
    if (!response.ok) {
      result.textContent = 'Unable to submit assessment at this time.';
      return;
    }
    const payload = await response.json();
    result.innerHTML = `
      <strong>Score:</strong> ${payload.score} / ${items.length * 3}<br />
      <strong>Severity:</strong> ${payload.severity}<br />
      <strong>Response:</strong> ${payload.reply}
    `;
  });

  assessmentShell.appendChild(title);
  if (assessment.scale) {
    assessmentShell.appendChild(scale);
  }
  assessmentShell.appendChild(form);
};

const loadLibrary = async () => {
  const response = await fetch(API.library);
  if (!response.ok) {
    libraryGrid.innerHTML = '<p>Library currently unavailable.</p>';
    return;
  }
  const items = await response.json();
  libraryGrid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'library-card';
    card.innerHTML = `
      <h4>${item.title}</h4>
      <ul>${item.steps.map(step => `<li>${step}</li>`).join('')}</ul>
    `;
    libraryGrid.appendChild(card);
  });
};

const loadStats = async () => {
  const response = await fetch(API.stats);
  if (!response.ok) {
    metricsGrid.innerHTML = '<p>Metrics unavailable.</p>';
    return;
  }
  const stats = await response.json();
  metricsGrid.innerHTML = '';
  const entries = [
    { label: 'Total Sessions', value: stats.total ?? 0 },
    { label: 'Crisis Flags', value: stats.crisisCount ?? 0 },
    { label: 'Tags', value: Object.keys(stats.tags || {}).length }
  ];
  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.innerHTML = `<p>${entry.label}</p><span>${entry.value}</span>`;
    metricsGrid.appendChild(card);
  });
};

const handleChatSubmit = async text => {
  if (!text) return;
  createMessage(text, 'user');
  chatInput.value = '';
  const response = await fetch(API.chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) {
    createMessage('We could not connect right now. Please try again.', 'assistant');
    return;
  }
  const payload = await response.json();
  if (payload.reply) {
    createMessage(payload.reply, 'assistant');
  }
  if (payload.crisis && payload.emergency) {
    createCrisisCard(payload.emergency);
  }
  if (payload.suggestion) {
    suggestionMessage.textContent = payload.suggestion.message;
    renderSuggestionButtons(payload.suggestion.options);
  }
  await loadStats();
};

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  handleChatSubmit(chatInput.value.trim());
});

quickStress.addEventListener('click', () => {
  chatInput.value = 'I feel stressed and overwhelmed.';
  chatInput.focus();
});

personalizedForm.addEventListener('submit', async event => {
  event.preventDefault();
  const feeling = document.getElementById('feeling').value.trim();
  const context = document.getElementById('context').value.trim();
  const response = await fetch(API.personalized, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feeling, context })
  });
  if (!response.ok) {
    personalizedOutput.textContent = 'Unable to generate plan right now.';
    return;
  }
  const plan = await response.json();
  personalizedOutput.innerHTML = `
    <strong>${plan.headline}</strong>
    <p>${plan.rationale}</p>
    <ul>${(plan.steps || []).map(step => `<li>${step}</li>`).join('')}</ul>
    <em>${plan.note}</em>
  `;
});

const closeSafetyModal = () => {
  safetyModal.hidden = true;
};

if (openSafety) {
  openSafety.addEventListener('click', () => {
    safetyModal.hidden = false;
  });
}

if (closeSafety) {
  closeSafety.addEventListener('click', closeSafetyModal);
}

if (safetyModal) {
  safetyModal.addEventListener('click', event => {
    if (event.target === safetyModal) {
      closeSafetyModal();
    }
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && safetyModal && !safetyModal.hidden) {
    closeSafetyModal();
  }
});

assessmentDock.addEventListener('click', () => {
  toggleAssessmentDrawer(true);
});

closeAssessments.addEventListener('click', () => {
  toggleAssessmentDrawer(false);
});

startCheckin.addEventListener('click', () => {
  document.getElementById('chat-panel').scrollIntoView({ behavior: 'smooth' });
  chatInput.focus();
});

document.querySelectorAll('[data-assessment]').forEach(button => {
  button.addEventListener('click', event => {
    const type = event.target.dataset.assessment;
    startAssessment(type);
  });
});

loadLibrary();
loadStats();

createMessage('Hello. How are you feeling today?');
