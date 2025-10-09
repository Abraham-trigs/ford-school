// src/types/library.ts
export interface Library {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  schoolId?: string;
}
