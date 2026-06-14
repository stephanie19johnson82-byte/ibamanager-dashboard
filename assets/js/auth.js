import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function registerUser({ username, email, password }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username,
    email,
    role: "viewer",
    balance: 1000,
    ownedTeam: null,
    createdAt: serverTimestamp()
  });
  return user;
}

async function loginUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

async function logoutUser() {
  await signOut(auth);
}

async function fetchCurrentUser(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export { registerUser, loginUser, logoutUser, fetchCurrentUser };
