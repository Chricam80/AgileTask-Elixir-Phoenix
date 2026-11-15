import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Microservice, KanbanTask, MatrixItem } from '../types';
import {
  INITIAL_MICROSERVICES,
  INITIAL_KANBAN_TASKS,
  MATRIX_ITEMS,
} from '../data/mockData';

// Firestore collection names
const COLLECTIONS = {
  MICROSERVICES: 'microservices',
  KANBAN_TASKS: 'kanban_tasks',
  MATRIX_ITEMS: 'matrix_items',
};

// Test connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    // If not found or permissions on test/connection, as long as it reaches server it's active
    if (error?.code === 'unavailable' || error?.message?.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable:', error);
      return false;
    }
    return true;
  }
}

// 1. Subscribe to Microservices
export function subscribeMicroservices(
  onData: (services: Microservice[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, COLLECTIONS.MICROSERVICES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // If empty in DB, return initial template so user sees default data
        onData(INITIAL_MICROSERVICES);
      } else {
        const list: Microservice[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.error('Error fetching microservices from Firestore:', err);
      if (onError) onError(err);
      onData(INITIAL_MICROSERVICES);
    }
  );
}

// 2. Subscribe to Kanban Tasks
export function subscribeTasks(
  onData: (tasks: KanbanTask[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, COLLECTIONS.KANBAN_TASKS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_KANBAN_TASKS);
      } else {
        const list: KanbanTask[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.error('Error fetching tasks from Firestore:', err);
      if (onError) onError(err);
      onData(INITIAL_KANBAN_TASKS);
    }
  );
}

// 3. Subscribe to Research Matrix Items
export function subscribeMatrix(
  onData: (items: MatrixItem[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, COLLECTIONS.MATRIX_ITEMS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(MATRIX_ITEMS);
      } else {
        const list: MatrixItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.error('Error fetching matrix items from Firestore:', err);
      if (onError) onError(err);
      onData(MATRIX_ITEMS);
    }
  );
}

// Mutations
export async function saveMicroservice(service: Microservice): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MICROSERVICES, service.id);
  const data = { ...service };
  delete (data as any).id;
  await setDoc(docRef, data, { merge: true });
}

export async function saveTask(task: KanbanTask): Promise<void> {
  const docRef = doc(db, COLLECTIONS.KANBAN_TASKS, task.id);
  const data = { ...task };
  delete (data as any).id;
  await setDoc(docRef, data, { merge: true });
}

export async function deleteTask(taskId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.KANBAN_TASKS, taskId);
  await deleteDoc(docRef);
}

export async function saveMatrixItem(item: MatrixItem): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATRIX_ITEMS, item.id);
  const data = { ...item };
  delete (data as any).id;
  await setDoc(docRef, data, { merge: true });
}

export async function deleteMatrixItem(itemId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATRIX_ITEMS, itemId);
  await deleteDoc(docRef);
}

// Seed or Reset Initial Database with one click
export async function seedDatabase(forceOverwrite = false): Promise<void> {
  const batch = writeBatch(db);

  // Check if microservices exist
  if (!forceOverwrite) {
    const existing = await getDocs(collection(db, COLLECTIONS.MICROSERVICES));
    if (!existing.empty) {
      console.log('Database already has records. Skipping initial seeding.');
      return;
    }
  }

  // Seed Microservices
  INITIAL_MICROSERVICES.forEach((svc) => {
    const docRef = doc(db, COLLECTIONS.MICROSERVICES, svc.id);
    const { id, ...data } = svc;
    batch.set(docRef, data);
  });

  // Seed Kanban Tasks
  INITIAL_KANBAN_TASKS.forEach((t) => {
    const docRef = doc(db, COLLECTIONS.KANBAN_TASKS, t.id);
    const { id, ...data } = t;
    batch.set(docRef, data);
  });

  // Seed Matrix Items
  MATRIX_ITEMS.forEach((m) => {
    const docRef = doc(db, COLLECTIONS.MATRIX_ITEMS, m.id);
    const { id, ...data } = m;
    batch.set(docRef, data);
  });

  await batch.commit();
}
