import Navbar  from "@/components/navbar";
import { AuthProvider } from "@/components/auth-provider";
import { SharedStateProvider } from '@/app/(client)/context/SharedStateContext';
import { ToastProvider } from '@/components/toast';


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SharedStateProvider>
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </SharedStateProvider>
    </AuthProvider>
  )
}