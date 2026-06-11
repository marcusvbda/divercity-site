import EsqueciSenhaForm from "./EsqueciSenhaForm";

export const metadata = { title: "Esqueci minha senha — Admin Divercity" };

export default function EsqueciSenhaPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gray-50 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <EsqueciSenhaForm />
      </div>
    </div>
  );
}
