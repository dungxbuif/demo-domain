export const metadata = {
  title: 'Demo Domain App',
  description: 'Next.js + NestJS on Kubernetes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
