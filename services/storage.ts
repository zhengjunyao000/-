
import { DrinkRecord } from '../types';

const STORAGE_KEY = 'bubble_tea_tracker_data';

export const storage = {
  getRecords: (): DrinkRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveRecords: (records: DrinkRecord[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },
  addRecord: (record: DrinkRecord): void => {
    const records = storage.getRecords();
    storage.saveRecords([record, ...records]);
  },
  deleteRecord: (id: string): void => {
    const records = storage.getRecords();
    storage.saveRecords(records.filter(r => r.id !== id));
  }
};
