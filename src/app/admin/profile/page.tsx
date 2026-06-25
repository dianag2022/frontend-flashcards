"use client";

import { ProfileContent } from "@/components/auth/ProfileContent";

export default function AdminProfilePage() {
  return <ProfileContent backHref="/admin" backLabel="Volver al panel" />;
}
