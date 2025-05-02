import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth,createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore ,doc,setDoc} from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI8jZmPqW07_onqpAkH828X9zquOddrHQ",
  authDomain: "mahathmaveliyancode-d7102.firebaseapp.com",
  projectId: "mahathmaveliyancode-d7102",
  storageBucket: "mahathmaveliyancode-d7102.firebasestorage.app",
  messagingSenderId: "150830646703",
  appId: "1:150830646703:web:d51ab99ec15e09f3d41b5a",
  measurementId: "G-2F935BM31F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export {  createUserWithEmailAndPassword, setDoc, doc };
