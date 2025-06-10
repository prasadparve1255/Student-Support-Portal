// export interface Student {
//   id: string;
//   name: string;
//   email: string;
//   department: string;
//   password: string;
// }

// export interface Admin {
//   username: string;
//   password: string;
//   department: string;
//   isMainAdmin: boolean;
// }

// export interface AuthState {
//   isAuthenticated: boolean;
//   currentStudent: Student | null;
//   currentAdmin: Admin | null;
//   isAdmin: boolean;
// }

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  password: string;
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