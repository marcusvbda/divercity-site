import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Esqueci minha senha — Admin Divercity",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {

  return <ForgotPasswordForm />;
}
