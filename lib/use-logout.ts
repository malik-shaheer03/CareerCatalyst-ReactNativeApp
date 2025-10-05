import { useAuth } from './auth-context';
import { useNotificationService } from './notification-service';

export const useLogout = () => {
  const { signOut } = useAuth();
  const { notifications } = useNotificationService();

  const logout = async () => {
    try {
      await signOut();
      notifications.logoutSuccess();
    } catch (error) {
      console.error("Error signing out:", error);
      notifications.customError('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  return { logout };
};
