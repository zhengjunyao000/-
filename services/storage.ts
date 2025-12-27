
import { DrinkRecord } from '../types';

// 本地存储的 Key
const STORAGE_KEY = 'bubble_tea_tracker_data';

/**
 * 封装持久化存储逻辑
 */
export const storage = {
  /**
   * 获取所有记录，按时间倒序排列
   */
  getRecords: (): DrinkRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 覆盖保存所有记录
   */
  saveRecords: (records: DrinkRecord[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  /**
   * 新增单条记录到开头
   */
  addRecord: (record: DrinkRecord): void => {
    const records = storage.getRecords();
    storage.saveRecords([record, ...records]);
  },

  /**
   * 根据 ID 删除记录
   */
  deleteRecord: (id: string): void => {
    const records = storage.getRecords();
    storage.saveRecords(records.filter(r => r.id !== id));
  }
};
