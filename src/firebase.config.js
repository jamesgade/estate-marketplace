import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

//app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBw13276uIRWlRylt1lyb4fprQI3OkOOlM",
    authDomain: "estate-marketplace-app.firebaseapp.com",
    projectId: "estate-marketplace-app",
    storageBucket: "estate-marketplace-app.appspot.com",
    messagingSenderId: "666367321547",
    appId: "1:666367321547:web:a8d6bb4c1abee4bc5b824e"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
