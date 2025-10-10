export enum StudentClasses {
  ONE = "1",
  TWO = "2",
  THREE = "3",
  FOUR = "4",
  FIVE = "5",
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  TEN = "10",
}

export interface Student {
  id?: string;
  name: string;
  class: StudentClasses | string;
  age: number;
  parent: string;
}

export interface User {
  id: string;
  role: string;
  schoolId: string;
}

export const Roles = ["ADMIN", "PRINCIPAL", "TEACHER"] as const;
export type Role = (typeof Roles)[number];
