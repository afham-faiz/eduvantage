import { Stack } from "@eduvantage/ui-web";
import { ApiStatus } from "@/components/ApiStatus";
import { DealsList } from "@/components/DealsList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-8">
      <Stack gap={2} className="items-center text-center">
        <h1 className="text-2xl font-semibold">Student Web</h1>
        <p className="text-sm text-neutral-500">
          Foundation integration proof — deals below come from the real API, not a mock.
        </p>
        <ApiStatus />
      </Stack>
      <DealsList />
    </main>
  );
}
