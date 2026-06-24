import { Suspense } from "react";
import ClientLoginPage from "./ClientLoginPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Cargando...</p>}>
      <ClientLoginPage />
    </Suspense>
  );
}
