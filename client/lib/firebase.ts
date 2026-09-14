import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBncGMrnFsKCEO0qw_5dTZCykbFum9JIaY",
  authDomain: "e-commerse-6f33a.firebaseapp.com",
  projectId: "e-commerse-6f33a",
  storageBucket: "e-commerse-6f33a.firebasestorage.app",
  messagingSenderId: "637395528438",
  appId: "1:637395528438:web:6dc54ade9badf1f1a39ad7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
