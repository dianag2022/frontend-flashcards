import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Cargando...</p>}>
      <AdminLoginPage />
    </Suspense>
  );
}
