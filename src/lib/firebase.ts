import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
  getIdToken,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDJa7QfkiYYj5VMkKnUEJQeCOSx2NYBsP4',
  authDomain: 'smartpdf-c2800.firebaseapp.com',
  projectId: 'smartpdf-c2800',
  storageBucket: 'smartpdf-c2800.firebasestorage.app',
  messagingSenderId: '1089616149347',
  appId: '1:1089616149347:web:7276837daf5cbdcb297156',
  measurementId: 'G-SCDQ6X3ZC3',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  firebaseSendEmailVerification,
  firebaseUpdateProfile,
  getIdToken,
};
export type { FirebaseUser };

