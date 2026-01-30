import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to convert snapshot to array
const snapshotToArray = (snapshot) => {
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// ============================================
// User Functions
// ============================================

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  // Map Firestore docs to our app user structure.
  // Note: older json had 'userId' (number), firestore has 'uid' (string).
  // We should normalize this. For now, we return data.
  return querySnapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }));
};

export const getUserById = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { ...docSnap.data(), userId: docSnap.id } : null;
};

// Create User is handled by AuthContext (register), but for "Add User" admin button:
export const createUser = async (userData) => {
  // Note: Creating a user in 'users' collection WITHOUT Auth account is tricky.
  // Ideally this should use a cloud function, but for now we just add the doc.
  // The user won't be able to login until they register with this email.
  // Or we assume this is just for record keeping.
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: new Date().toISOString()
  });
  return { ...userData, userId: docRef.id };
};

export const updateUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: new Date().toISOString()
  });
  return { ...userData, userId };
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
  return true;
};

// ============================================
// Class Functions
// ============================================

export const getClasses = async () => {
  const q = collection(db, 'classes');
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const getClassById = async (classId) => {
  // If classId is number, we might need to query. If string (docId), direct get.
  // Migration script used original IDs. Let's assume we query by field if it's legacy ID, 
  // but better to assuming the ID passed IS the document ID.
  // For migrated data, document ID might be "1", "2" etc or auto-generated.
  const docRef = doc(db, 'classes', String(classId));
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { ...docSnap.data(), classId: docSnap.id };

  // Fallback: Query by 'classId' field if it was stored as a field
  const q = query(collection(db, 'classes'), where('classId', '==', classId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
  return null;
};

export const getClassesByKhadem = async (userId) => {
  // Logic: Look for classes where khadems array contains userId
  const q = query(collection(db, 'classes'), where('khadems', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const createClass = async (classData) => {
  const docRef = await addDoc(collection(db, 'classes'), {
    ...classData,
    createdAt: new Date().toISOString(),
    isActive: true
  });
  // We also set the 'classId' field to the docId for consistency if needed, 
  // or just rely on doc ID. Let's rely on doc ID but for compatibility with
  // int-based code, we might need to be careful.
  // For now, let's treat doc ID as the source of truth.
  await updateDoc(docRef, { classId: docRef.id });
  return { ...classData, classId: docRef.id, id: docRef.id };
};

export const updateClass = async (classId, classData) => {
  // Assuming classId passed here is the Document ID
  const classRef = doc(db, 'classes', String(classId));
  await updateDoc(classRef, {
    ...classData,
    updatedAt: new Date().toISOString()
  });
  return { ...classData, classId };
};

export const deleteClass = async (classId) => {
  await deleteDoc(doc(db, 'classes', String(classId)));
  return true;
};

// ============================================
// Makhdoumeen Functions
// ============================================

export const getMakhdoumeen = async () => {
  const snapshot = await getDocs(collection(db, 'makhdoumeen'));
  return snapshotToArray(snapshot);
};

export const getMakhdoumeenByClass = async (classId) => {
  const q = query(collection(db, 'makhdoumeen'), where('classId', '==', classId));
  const snapshot = await getDocs(q);
  return snapshotToArray(snapshot);
};

export const createMakhdoum = async (data) => {
  const docRef = await addDoc(collection(db, 'makhdoumeen'), {
    ...data,
    createdAt: new Date().toISOString(),
    isActive: true
  });
  await updateDoc(docRef, { makhdoumId: docRef.id });
  return { ...data, makhdoumId: docRef.id };
};

export const updateMakhdoum = async (makhdoumId, data) => {
  const ref = doc(db, 'makhdoumeen', String(makhdoumId));
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  return { ...data, makhdoumId };
};

export const deleteMakhdoum = async (makhdoumId) => {
  await deleteDoc(doc(db, 'makhdoumeen', String(makhdoumId)));
  return true;
};

export const getMakhdoumById = async (makhdoumId) => {
  try {
    const ref = doc(db, 'makhdoumeen', String(makhdoumId));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...snap.data(), makhdoumId: snap.id };
    }
    return null;
  } catch (e) {
    console.error("Error fetching makhdoum by ID:", e);
    return null;
  }
};

// ============================================
// Team Functions
// ============================================

export const getTeams = async () => {
  const snapshot = await getDocs(collection(db, 'teams'));
  return snapshotToArray(snapshot);
};

export const updateTeam = async (teamId, teamData) => {
  const ref = doc(db, 'teams', String(teamId));
  await updateDoc(ref, {
    ...teamData,
    updatedAt: new Date().toISOString()
  });
  return { ...teamData, teamId };
};

export const assignClassToTeam = async (teamId, classId) => {
  // 1. Get all teams to find where the class currently is
  const allTeams = await getTeams();

  // 2. Remove class from any other team
  const updates = [];
  for (const team of allTeams) {
    if (team.classIds && team.classIds.includes(classId)) {
      // If it's the target team, we might duplicate if we don't check, 
      // but the logic below expects to add it to target.
      // If it's ALREADY in target and nowhere else, we're good.
      // If it's in multiple (shouldn't happen), we remove it.
      if (String(team.teamId) !== String(teamId)) {
        const newClassIds = team.classIds.filter(id => id !== classId);
        updates.push(updateTeam(team.teamId, { classIds: newClassIds }));
      }
    }
  }

  // 3. Add to target team
  const targetTeam = allTeams.find(t => String(t.teamId) === String(teamId));
  if (targetTeam) {
    const currentIds = targetTeam.classIds || [];
    if (!currentIds.includes(classId)) {
      updates.push(updateTeam(teamId, { classIds: [...currentIds, classId] }));
    }
  }

  await Promise.all(updates);
  return true;
};

export const createTeam = async (teamData) => {
  const docRef = await addDoc(collection(db, 'teams'), {
    ...teamData,
    createdAt: new Date().toISOString()
  });
  await updateDoc(docRef, { teamId: docRef.id });
  return { ...teamData, teamId: docRef.id };
};

export const deleteTeam = async (teamId) => {
  await deleteDoc(doc(db, 'teams', String(teamId)));
  return true;
};

// ============================================
// Event Functions
// ============================================

export const getEvents = async () => {
  const snapshot = await getDocs(collection(db, 'events'));
  return snapshotToArray(snapshot);
};

export const createEvent = async (eventData) => {
  const docRef = await addDoc(collection(db, 'events'), {
    ...eventData,
    createdAt: new Date().toISOString(),
    status: 'upcoming'
  });
  await updateDoc(docRef, { eventId: docRef.id });
  return { ...eventData, eventId: docRef.id };
};

export const updateEvent = async (eventId, eventData) => {
  const ref = doc(db, 'events', String(eventId));
  await updateDoc(ref, {
    ...eventData,
    updatedAt: new Date().toISOString()
  });
  return { ...eventData, eventId };
};

export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, 'events', String(eventId)));
  return true;
};

// ============================================
// Score Functions
// ============================================

export const getScores = async () => {
  const snapshot = await getDocs(collection(db, 'scores'));
  return snapshotToArray(snapshot);
};

export const addScore = async (scoreData) => {
  const docRef = await addDoc(collection(db, 'scores'), {
    ...scoreData,
    enteredAt: new Date().toISOString()
  });
  return { ...scoreData, scoreId: docRef.id };
};

// ============================================
// Statistics (dashboard)
// ============================================

export const getStatistics = async () => {
  // In a real app eventually you want to use aggregation queries or counters
  // but for now, we fetch all and count (standard for smaller apps)
  const [users, classes, makhdoumeen, events] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'classes')),
    getDocs(collection(db, 'makhdoumeen')),
    getDocs(collection(db, 'events'))
  ]);

  const usersData = snapshotToArray(users);
  const classesData = snapshotToArray(classes);
  const makhData = snapshotToArray(makhdoumeen);
  const eventsData = snapshotToArray(events);

  return {
    totalUsers: usersData.filter(u => u.isActive).length,
    totalClasses: classesData.filter(c => c.isActive).length,
    totalMakhdoumeen: makhData.filter(m => m.isActive).length,
    totalEvents: eventsData.length,
    upcomingEvents: eventsData.filter(e => e.status === 'upcoming').length,
    adminCount: usersData.filter(u => u.role === 'Admin' && u.isActive).length,
    aminCount: usersData.filter(u => u.role === 'Amin' && u.isActive).length,
    khademCount: usersData.filter(u => u.role === 'Khadem' && u.isActive).length
  };
};
