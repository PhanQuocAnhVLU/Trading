import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDGRkLI-n5wsNwLZBd0YhiDcfKrHtkWbfs',
  authDomain: 'trading-project-5707b.firebaseapp.com',
  projectId: 'trading-project-5707b',
  storageBucket: 'trading-project-5707b.firebasestorage.app',
  messagingSenderId: '1030091832587',
  appId: '1:1030091832587:web:910d63505fd6dfcc9f360e',
  measurementId: 'G-W8RZZ6VZTL',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
