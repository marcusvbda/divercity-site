import { getContentType } from "@/lib/cms";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Esqueci minha senha — Admin Divercity" };

export default async function ForgotPasswordPage() {
  const navbar = await getContentType("NavBar");
  const logoUrl = navbar?.Logo?.url?.value as string | undefined;

  return <ForgotPasswordForm logoUrl={logoUrl} />;
}
