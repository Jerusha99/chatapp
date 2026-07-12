export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bruce-50 via-white to-bruce-100 dark:from-gray-900 dark:via-bruce-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
