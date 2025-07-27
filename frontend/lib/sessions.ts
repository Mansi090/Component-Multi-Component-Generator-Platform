// lib/sessions.ts
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";

export const createSession = async (userId: string, title = "Untitled Project") => {
  const docRef = await addDoc(collection(db, "sessions"), {
    userId,
    title,
    createdAt: new Date(),
    chat: [],
    jsxCode: "",
    cssCode: "",
    uiState: {}
  });
  return docRef.id;
};

export const getUserSessions = async (userId: string) => {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
