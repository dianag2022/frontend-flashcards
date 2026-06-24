import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/lib/constants";

export default function Home() {
  redirect(`${ADMIN_PATH}/login`);
}
