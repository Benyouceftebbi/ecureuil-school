// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth,browserLocalPersistence } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfwJUoFK4uK2rFns076yD-JMcqwGyorbo",
  authDomain: "ecureuil-db.firebaseapp.com",
  projectId: "ecureuil-db",
  storageBucket: "ecureuil-db.appspot.com",
  messagingSenderId: "1094337774123",
  appId: "1:1094337774123:web:84a4c77ecb599e5857606e",
  measurementId: "G-BG72SGEXSW"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app,{ persistence: browserLocalPersistence});
const db = getFirestore(app)
const storage = getStorage(app);

export {db , storage}
export default app 