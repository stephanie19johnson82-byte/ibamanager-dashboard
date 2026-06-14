"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export async function fetchCollection(
  collectionName: string,
  filters: QueryConstraint[] = [],
  orders: QueryConstraint[] = []
) {
  const col = collection(db, collectionName);
  const q = filters.length || orders.length ? query(col, ...filters, ...orders) : col;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

export async function fetchDoc(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function saveDoc(collectionName: string, id: string, data: DocumentData) {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
}

export async function updateDocFields(collectionName: string, id: string, data: Partial<DocumentData>) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

const MAX_BATCH_SIZE = 400;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function batchWrite(
  records: Array<{ collectionName: string; id: string; data: DocumentData }>
) {
  const chunks = chunkArray(records, MAX_BATCH_SIZE);
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(({ collectionName, id, data }) => {
      const ref = doc(db, collectionName, id);
      batch.set(ref, data, { merge: true });
    });
    await batch.commit();
  }
}
