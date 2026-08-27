// src/types/index.ts
import { registerRootComponent } from 'expo';
import App from './App';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TimetableItem {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
}
registerRootComponent(App);