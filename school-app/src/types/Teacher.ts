export interface Teacher {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: "TEACHER" | "HEAD_TEACHER" | "ADMIN";
  subjects: string[];
  classes: string[];
  hireDate?: string;
  active?: boolean;
  schoolId?: string;
}
