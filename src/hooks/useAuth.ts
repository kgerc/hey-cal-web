import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut, signInWithGoogle, signInWithFacebook } = useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
  };
}
