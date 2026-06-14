import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function fetchCollection(collectionName, filters = [], orders = []) {
  const col = collection(db, collectionName);
  const q = filters.length || orders.length ? query(col, ...filters, ...orders) : col;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

async function fetchDoc(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

async function saveDoc(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
}

async function updateDocFields(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

async function batchWrite(records) {
  const batch = writeBatch(db);
  records.forEach(({ collectionName, id, data }) => {
    const ref = doc(db, collectionName, id);
    batch.set(ref, data, { merge: true });
  });
  await batch.commit();
}

export { fetchCollection, fetchDoc, saveDoc, updateDocFields, batchWrite };
