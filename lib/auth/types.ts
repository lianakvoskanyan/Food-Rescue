export type UserRole = "customer" | "seller" | "admin";

export type UserProfile = {
  id: string;
  authId: string;
  email: string;
  displayName: string | null;
  role: UserRole;
};

export type AuthState = {
  userId: string;
  email: string;
  profile: UserProfile;
};
