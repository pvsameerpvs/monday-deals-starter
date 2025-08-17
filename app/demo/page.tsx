import { Button } from "@/components/ui/button";

export default function Demo() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-black/10 p-6 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">Style Check</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Buttons below verify Tailwind + shadcn-style components are alive.
        </p>
        <div className="mt-4 flex gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </main>
  );
}