import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDJa7QfkiYYj5VMkKnUEJQeCOSx2NYBsP4',
  authDomain: 'smartpdf-c2800.firebaseapp.com',
  projectId: 'smartpdf-c2800',
  storageBucket: 'smartpdf-c2800.firebasestorage.app',
  messagingSenderId: '1089616149347',
  appId: '1:1089616149347:web:7276837daf5cbdcb297156',
  measurementId: 'G-SCDQ6X3ZC3',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser };
