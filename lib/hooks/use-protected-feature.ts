import { useAuthStore } from '@/lib/store/auth-store';
import { useState } from 'react';

export function useProtectedFeature(featureName?: string) {
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const canAccessFeature = useAuthStore((state) => state.canAccessFeature);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const checkAccess = () => {
    if (!featureName) {
      return isAuthenticated;
    }
    return canAccessFeature(featureName);
  };

  const handleFeatureAccess = () => {
    const hasAccess = checkAccess();
    if (!hasAccess) {
      setIsAuthModalVisible(true);
      return false;
    }
    return true;
  };

  const hideAuthModal = () => {
    setIsAuthModalVisible(false);
  };

  return {
    isAuthModalVisible,
    hideAuthModal,
    handleFeatureAccess,
    isAuthenticated,
  };
}