import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth,createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjiNip6kJFTAtoEXRRmMKrALKY10ix6Og",
  authDomain: "mahathmawebsite.firebaseapp.com",
  projectId: "mahathmawebsite",
  storageBucket: "mahathmawebsite.firebasestorage.app",
  messagingSenderId: "565626635632",
  appId: "1:565626635632:web:772a5fe7de852740c07bb5",
  measurementId: "G-ND9HM6FTWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { createUserWithEmailAndPassword, setDoc, doc, collection, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy, ref, uploadBytes, getDownloadURL };
