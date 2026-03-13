const POINT_VALUE = 500;
const API_URL = '/api';

let state = {
  reps: [],
  actions: [],
  reports: [],
};

async function loadState() {
  try {
    const [repsRes, actionsRes, reportsRes] = await Promise.all([
      fetch(`${API_URL}/reps`),
      fetch(`${API_URL}/actions`),
      fetch(`${API_URL}/reports`)
    ]);

    const repsData = await repsRes.json();
    const actionsData = await actionsRes.json();
    const reportsData = await reportsRes.json();

    state.reps = repsData;
    state.actions = actionsData;
    state.reports = reportsData;

    return true;
  } catch (err) {
    console.error('Error loading state:', err);
    return false;
  }
}

// Keeping save for compatibility but it should be replaced by specific API calls
function save() {
  console.warn('save() is deprecated. Use specific API calls instead.');
}