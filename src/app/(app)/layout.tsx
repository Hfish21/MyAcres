import { HomesteadProvider } from "@/components/homestead-provider";
import { AppShell } from "@/components/homestead/app-shell";

// Layout for the application routes (the Garden module views). The marketing
// landing at "/" lives outside this group, so it renders chrome-free and never
// mounts the homestead store. Everything under (app) gets the provider + shell.
export default function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <HomesteadProvider>
      <AppShell>{children}</AppShell>
    </HomesteadProvider>
  );
}
