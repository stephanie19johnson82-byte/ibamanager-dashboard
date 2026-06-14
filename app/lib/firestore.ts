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

function normalizeFirestoreValue(value: any): any {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    const normalizedArray = value
      .map(normalizeFirestoreValue)
      .filter((item) => item !== undefined);
    const hasNestedArray = normalizedArray.some(Array.isArray);
    if (hasNestedArray) {
      return Object.fromEntries(normalizedArray.map((item, index) => [String(index), item]));
    }
    return normalizedArray;
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, nestedValue]) => [key, normalizeFirestoreValue(nestedValue)])
        .filter(([, normalizedValue]) => normalizedValue !== undefined)
    );
  }
  return value;
}

function normalizeFirestoreData(data: any) {
  if (data === undefined || data === null) return data;
  if (Array.isArray(data)) return normalizeFirestoreValue(data);
  if (typeof data !== "object") return data;
  return normalizeFirestoreValue(data);
}

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
  await setDoc(doc(db, collectionName, id), normalizeFirestoreData(data), { merge: true });
}

export async function updateDocFields(collectionName: string, id: string, data: Partial<DocumentData>) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, normalizeFirestoreData(data));
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
      batch.set(ref, normalizeFirestoreData(data), { merge: true });
    });
    await batch.commit();
  }
}
