export interface Exam {
  id?: string;
  title: string;
  description?: string;
  date: string; // ISO string
  classId: string;
  schoolId?: string;
}
