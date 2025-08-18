import Swal from 'sweetalert2';
import { useTheme } from '@/providers/ThemeProvider';

export const useSweetAlert = () => {
  const { isDark } = useTheme();

  const getThemeConfig = () => ({
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    customClass: {
      popup: isDark ? 'dark-popup' : 'light-popup',
      title: isDark ? 'text-white' : 'text-gray-900',
      htmlContainer: isDark ? 'text-gray-300' : 'text-gray-700',
    }
  });

  const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      ...getThemeConfig()
    });
  };

  const showError = (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'OK',
      ...getThemeConfig()
    });
  };

  const showWarning = (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
      ...getThemeConfig()
    });
  };

  const showInfo = (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'OK',
      ...getThemeConfig()
    });
  };

  const showConfirm = (title: string, text?: string, confirmText = 'Yes', cancelText = 'Cancel') => {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      ...getThemeConfig()
    });
  };

  const showDeleteConfirm = (itemName?: string) => {
    return Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: itemName 
        ? `You won't be able to recover "${itemName}"!` 
        : "You won't be able to recover this item!",
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...getThemeConfig()
    });
  };

  const showLoading = (title = 'Loading...', text?: string) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...getThemeConfig()
    });
  };

  const showProgressToast = (title: string, progress: number) => {
    return Swal.fire({
      title,
      html: `
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <p class="mt-2 text-sm">${progress}% complete</p>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      toast: true,
      position: 'top-end',
      ...getThemeConfig()
    });
  };

  const close = () => {
    Swal.close();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    showProgressToast,
    close
  };
};