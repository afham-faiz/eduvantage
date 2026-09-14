import { Stack } from "@eduvantage/ui-web";
import { ApiStatus } from "@/components/ApiStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Stack gap={4}>
        <h1 className="text-2xl font-semibold">Student Web</h1>
        <p className="text-sm text-neutral-500">Foundation placeholder — no product UI yet.</p>
        <ApiStatus />
      </Stack>
    </main>
  );
}
