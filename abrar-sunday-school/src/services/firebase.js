// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxcGn6PEarxKJcfrkRkHspouNeAIVQDzA",
    authDomain: "abrar-system.firebaseapp.com",
    projectId: "abrar-system",
    storageBucket: "abrar-system.firebasestorage.app",
    messagingSenderId: "931775160819",
    appId: "1:931775160819:web:ebf24eb28bd59ce90df286"
};

// Initialize Firebase
console.log("FIREBASE DEBUG: Initializing with config:", JSON.stringify(firebaseConfig, null, 2));
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;