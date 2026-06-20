export interface UserPreferences {
  theme: 'light' | 'dark';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: number;
  preferences?: UserPreferences;
}
