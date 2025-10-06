import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCy3vq_hwtsAYylrscz-zW82vALb4nPJO4",
  authDomain: "narayanganj-traveller-bd.firebaseapp.com",
  projectId: "narayanganj-traveller-bd",
  storageBucket: "narayanganj-traveller-bd.firebasestorage.app",
  messagingSenderId: "275509624245",
  appId: "1:275509624245:web:d38230dbc6d7a5a813edfc",
  measurementId: "G-0RE0D001NS",
  databaseURL: "https://narayanganj-traveller-bd-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app); 