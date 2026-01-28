import { db } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import {
    getUsers,
    getClasses,
    getMakhdoumeen,
    getEvents,
    getTeams
} from './mockApi';

export const migrateData = async () => {
    try {
        const batch = writeBatch(db);
        let operationCount = 0;
        const BATCH_LIMIT = 450; // Firestore batch limit is 500

        const commitBatchIfFull = async () => {
            if (operationCount >= BATCH_LIMIT) {
                await batch.commit();
                operationCount = 0;
                // Create new batch? No, writeBatch returns a new instance.
                // Actually, standard pattern is to use a new batch. 
                // For simplicity in this script, we'll just do individual setDocs or smaller batches if needed.
                // But for robust migration, let's just do individual writes for now to avoid complexity with batch management unless dataset is huge.
                // The dataset is likely small (<100 items).
            }
        };

        // 1. Migrate Users
        const users = getUsers();
        for (const user of users) {
            // For users, we prefer to use the Auth UID as the document ID.
            // But for existing "mock" users, they have numeric IDs (1, 2, 3).
            // We will migrate them as is, but newly registered users will have Auth UIDs.
            // This might cause a mix of ID types (string '1' vs 'abcUID').
            // We'll store them as string versions of their numeric ID.
            const userRef = doc(db, 'users', String(user.userId));
            // Don't overwrite if it exists (e.g. if we ran this before), but here we want to force migration.
            await setDoc(userRef, { ...user, migrated: true });
            console.log(`Migrated user ${user.userId}`);
        }

        // 2. Migrate Classes
        const classes = getClasses();
        for (const cls of classes) {
            const classRef = doc(db, 'classes', String(cls.classId));
            await setDoc(classRef, { ...cls, migrated: true });
            console.log(`Migrated class ${cls.classId}`);
        }

        // 3. Migrate Makhdoumeen
        const makhdoumeen = getMakhdoumeen();
        for (const m of makhdoumeen) {
            const mRef = doc(db, 'makhdoumeen', String(m.makhdoumId));
            await setDoc(mRef, { ...m, migrated: true });
            console.log(`Migrated makhdoum ${m.makhdoumId}`);
        }

        // 4. Migrate Events
        const events = getEvents();
        for (const event of events) {
            const eventRef = doc(db, 'events', String(event.eventId));
            await setDoc(eventRef, { ...event, migrated: true });
            console.log(`Migrated event ${event.eventId}`);
        }

        // 5. Migrate Teams
        const teams = getTeams();
        for (const team of teams) {
            const teamRef = doc(db, 'teams', String(team.teamId));
            await setDoc(teamRef, { ...team, migrated: true });
            console.log(`Migrated team ${team.teamId}`);
        }

        console.log('Migration completed successfully!');
        return { success: true, count: users.length + classes.length + makhdoumeen.length + events.length + teams.length };

    } catch (error) {
        console.error('Migration failed:', error);
        return { success: false, error: error.message };
    }
};
