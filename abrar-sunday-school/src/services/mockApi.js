// Mock API service for handling data operations with localStorage persistence
import usersData from '../data/users.json';
import teamsData from '../data/teams.json';
import classesData from '../data/classes.json';
import makhdoumeenData from '../data/makhdoumeen.json';
import eventsData from '../data/events.json';

// Initialize localStorage with default data if not exists
const initializeStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(usersData));
  }
  if (!localStorage.getItem('teams')) {
    localStorage.setItem('teams', JSON.stringify(teamsData));
  }
  if (!localStorage.getItem('classes')) {
    localStorage.setItem('classes', JSON.stringify(classesData));
  }
  if (!localStorage.getItem('makhdoumeen')) {
    localStorage.setItem('makhdoumeen', JSON.stringify(makhdoumeenData));
  }
  if (!localStorage.getItem('events')) {
    localStorage.setItem('events', JSON.stringify(eventsData));
  }
  if (!localStorage.getItem('scores')) {
    localStorage.setItem('scores', JSON.stringify([]));
  }
};

// Generic get function
const getData = (key) => {
  initializeStorage();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Generic set function
const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
};

// Auth functions
export const login = (username, password) => {
  const users = getData('users');
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Check if user is pending
    if (user.role === 'Guest' || user.role === 'Pending') {
      return { error: 'Your account is pending approval by an administrator.' };
    }

    // Update last login
    const updatedUsers = users.map(u =>
      u.userId === user.userId
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    setData('users', updatedUsers);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const loginWithGoogle = (email, fullName, photoUrl) => {
  const users = getData('users');
  let user = users.find(u => u.email === email || (u.username === email)); // Match by email or username

  if (user) {
    // User exists
    if (user.role === 'Guest' || user.role === 'Pending') {
      return { error: 'Your account is pending approval by an administrator.' };
    }

    // Update user info (e.g. photo)
    const updatedUsers = users.map(u =>
      u.userId === user.userId
        ? { ...u, lastLogin: new Date().toISOString(), photoUrl: photoUrl || u.photoUrl, fullName: fullName || u.fullName }
        : u
    );
    setData('users', updatedUsers);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } else {
    // Create new pending user
    const newUser = {
      userId: Math.max(...users.map(u => u.userId), 0) + 1,
      username: email, // Use email as username for google users
      password: '', // No password
      fullName: fullName || email.split('@')[0],
      email: email,
      photoUrl: photoUrl,
      role: 'Pending',
      isActive: true,
      isGoogle: true,
      createdAt: new Date().toISOString()
    };
    setData('users', [...users, newUser]);
    return { pending: true, message: 'Account created! Please wait for admin approval.' };
  }
};

export const registerUser = (userData) => {
  const users = getData('users');

  // Check if username already exists
  if (users.some(u => u.username === userData.username)) {
    return { success: false, error: 'Username already exists' };
  }

  const newUser = {
    userId: Math.max(...users.map(u => u.userId), 0) + 1,
    username: userData.username,
    password: userData.password,
    fullName: userData.fullName,
    role: 'Pending', // Default role waiting for admin approval
    isActive: true,
    createdAt: new Date().toISOString()
  };

  setData('users', [...users, newUser]);
  return { success: true, user: newUser };
};

// User functions
export const getUsers = () => getData('users');

export const getUserById = (userId) => {
  const users = getData('users');
  return users.find(u => u.userId === userId);
};

export const createUser = (userData) => {
  const users = getData('users');
  const newUser = {
    ...userData,
    userId: Math.max(...users.map(u => u.userId), 0) + 1,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  setData('users', [...users, newUser]);
  return newUser;
};

export const updateUser = (userId, userData) => {
  const users = getData('users');
  const updatedUsers = users.map(u =>
    u.userId === userId ? { ...u, ...userData, updatedAt: new Date().toISOString() } : u
  );
  setData('users', updatedUsers);
  return updatedUsers.find(u => u.userId === userId);
};

export const deleteUser = (userId) => {
  const users = getData('users');
  const updatedUsers = users.filter(u => u.userId !== userId);
  setData('users', updatedUsers);
  return true;
};

// Class functions
export const getClasses = () => getData('classes');

export const getClassById = (classId) => {
  const classes = getData('classes');
  return classes.find(c => c.classId === classId);
};

export const getClassesByKhadem = (userId) => {
  const users = getData('users');
  const user = users.find(u => u.userId === userId);
  const classes = getData('classes');

  if (user && user.classId) {
    return classes.filter(c => c.classId === user.classId);
  }

  return classes.filter(c => c.khadems && c.khadems.includes(userId));
};

export const createClass = (classData) => {
  const classes = getData('classes');
  const newClass = {
    ...classData,
    classId: Math.max(...classes.map(c => c.classId), 0) + 1,
    createdAt: new Date().toISOString(),
    isActive: true,
    khadems: classData.khadems || []
  };
  setData('classes', [...classes, newClass]);
  return newClass;
};

export const updateClass = (classId, classData) => {
  const classes = getData('classes');
  const updatedClasses = classes.map(c =>
    c.classId === classId ? { ...c, ...classData, updatedAt: new Date().toISOString() } : c
  );
  setData('classes', updatedClasses);
  return updatedClasses.find(c => c.classId === classId);
};

export const deleteClass = (classId) => {
  const classes = getData('classes');
  const updatedClasses = classes.filter(c => c.classId !== classId);
  setData('classes', updatedClasses);
  return true;
};

// Makhdoumeen functions
export const getMakhdoumeen = () => getData('makhdoumeen');

export const getMakhdoumById = (makhdoumId) => {
  const makhdoumeen = getData('makhdoumeen');
  return makhdoumeen.find(m => m.makhdoumId === makhdoumId);
};

export const getMakhdoumeenByClass = (classId) => {
  const makhdoumeen = getData('makhdoumeen');
  return makhdoumeen.filter(m => m.classId === classId && m.isActive);
};

export const createMakhdoum = (makhdoumData) => {
  const makhdoumeen = getData('makhdoumeen');
  const lastCode = makhdoumeen.length > 0
    ? Math.max(...makhdoumeen.map(m => parseInt(m.makhdoumCode.split('-')[1])))
    : 0;

  const newMakhdoum = {
    ...makhdoumData,
    makhdoumId: Math.max(...makhdoumeen.map(m => m.makhdoumId), 0) + 1,
    makhdoumCode: `MKD-${String(lastCode + 1).padStart(6, '0')}`,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  setData('makhdoumeen', [...makhdoumeen, newMakhdoum]);
  return newMakhdoum;
};

export const updateMakhdoum = (makhdoumId, makhdoumData) => {
  const makhdoumeen = getData('makhdoumeen');
  const updatedMakhdoumeen = makhdoumeen.map(m =>
    m.makhdoumId === makhdoumId ? { ...m, ...makhdoumData, updatedAt: new Date().toISOString() } : m
  );
  setData('makhdoumeen', updatedMakhdoumeen);
  return updatedMakhdoumeen.find(m => m.makhdoumId === makhdoumId);
};

export const deleteMakhdoum = (makhdoumId) => {
  const makhdoumeen = getData('makhdoumeen');
  const updatedMakhdoumeen = makhdoumeen.filter(m => m.makhdoumId !== makhdoumId);
  setData('makhdoumeen', updatedMakhdoumeen);
  return true;
};

// Team functions
export const getTeams = () => getData('teams');

export const getTeamsByEvent = (eventId) => {
  const teams = getData('teams');
  return teams.filter(t => t.eventId === eventId);
};

export const getTeamById = (teamId) => {
  const teams = getData('teams');
  return teams.find(t => t.teamId === teamId);
};

export const getTeamByClassAndEvent = (classId, eventId) => {
  const teams = getData('teams');
  return teams.find(t => t.eventId === eventId && t.classIds && t.classIds.includes(classId));
};

export const createTeam = (teamData) => {
  const teams = getData('teams');
  const newTeam = {
    ...teamData,
    teamId: Math.max(...teams.map(t => t.teamId), 0) + 1,
    createdAt: new Date().toISOString()
  };
  setData('teams', [...teams, newTeam]);
  return newTeam;
};

export const updateTeam = (teamId, teamData) => {
  const teams = getData('teams');
  const updatedTeams = teams.map(t =>
    t.teamId === teamId ? { ...t, ...teamData, updatedAt: new Date().toISOString() } : t
  );
  setData('teams', updatedTeams);
  return updatedTeams.find(t => t.teamId === teamId);
};

export const assignClassToTeam = (teamId, classId) => {
  const teams = getData('teams');
  // First remove class from any other team
  const updatedTeams = teams.map(t => ({
    ...t,
    classIds: t.classIds.filter(id => id !== classId)
  }));

  // Then add to target team
  const targetTeamIndex = updatedTeams.findIndex(t => t.teamId === teamId);
  if (targetTeamIndex !== -1) {
    updatedTeams[targetTeamIndex].classIds.push(classId);
  }

  setData('teams', updatedTeams);
  return updatedTeams[targetTeamIndex];
};

// Score functions
export const getScores = () => getData('scores');

export const addScore = (scoreData) => {
  const scores = getData('scores');
  const newScore = {
    ...scoreData,
    scoreId: Math.max(...scores.map(s => s.scoreId), 0) + 1,
    enteredAt: new Date().toISOString()
  };
  setData('scores', [...scores, newScore]);
  return newScore;
};

// Event functions
export const getEvents = () => getData('events');

export const getEventById = (eventId) => {
  const events = getData('events');
  return events.find(e => e.eventId === eventId);
};

export const createEvent = (eventData) => {
  const events = getData('events');
  const newEvent = {
    ...eventData,
    eventId: Math.max(...events.map(e => e.eventId), 0) + 1,
    createdAt: new Date().toISOString(),
    status: 'upcoming'
  };
  setData('events', [...events, newEvent]);
  return newEvent;
};

export const updateEvent = (eventId, eventData) => {
  const events = getData('events');
  const updatedEvents = events.map(e =>
    e.eventId === eventId ? { ...e, ...eventData, updatedAt: new Date().toISOString() } : e
  );
  setData('events', updatedEvents);
  return updatedEvents.find(e => e.eventId === eventId);
};

export const deleteEvent = (eventId) => {
  const events = getData('events');
  const updatedEvents = events.filter(e => e.eventId !== eventId);
  setData('events', updatedEvents);
  return true;
};

// Statistics functions
export const getStatistics = () => {
  const users = getData('users');
  const classes = getData('classes');
  const makhdoumeen = getData('makhdoumeen');
  const events = getData('events');

  return {
    totalUsers: users.filter(u => u.isActive).length,
    totalClasses: classes.filter(c => c.isActive).length,
    totalMakhdoumeen: makhdoumeen.filter(m => m.isActive).length,
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    adminCount: users.filter(u => u.role === 'Admin' && u.isActive).length,
    aminCount: users.filter(u => u.role === 'Amin' && u.isActive).length,
    khademCount: users.filter(u => u.role === 'Khadem' && u.isActive).length
  };
};
