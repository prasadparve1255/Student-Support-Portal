export interface Student {
  id: string;
  _id?: string;
  name: string;
  email: string;
  department: string;
  password: string;
  class?: string;
}

export interface Admin {
  username: string;
  password: string;
  department: string;
  isMainAdmin: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentStudent: Student | null;
  currentAdmin: Admin | null;
  isAdmin: boolean;
}
