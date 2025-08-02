import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyD3TUH96n93daZQMAgoAE9IvAIq7EVcr5I", // Mevcut Gemini API key'i kullanıyoruz
  authDomain: "intermatch-app.firebaseapp.com",
  projectId: "intermatch-app",
  storageBucket: "intermatch-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Auth servislerini al
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app; 