const POINT_VALUE = 500;
const API_URL = '/api';

let state = {
  reps: [],
  actions: [],
  reports: [],
  admins: [],
  currentAdmin: null
};

async function loadState() {
  try {
    const fetchPromises = [
      fetch(`${API_URL}/reps`),
      fetch(`${API_URL}/actions`),
      fetch(`${API_URL}/reports`)
    ];

    // If super admin, fetch admins list
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
        state.currentAdmin = JSON.parse(storedAdmin);
        if (state.currentAdmin.isSuperAdmin) {
            fetchPromises.push(fetch(`${API_URL}/admins`));
        }
    }

    const responses = await Promise.all(fetchPromises);

    state.reps = await responses[0].json();
    state.actions = await responses[1].json();
    state.reports = await responses[2].json();

    if (state.currentAdmin && state.currentAdmin.isSuperAdmin && responses[3]) {
        state.admins = await responses[3].json();
    }

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
