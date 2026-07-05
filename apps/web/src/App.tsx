import { Button } from '@479property/ui';

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">479Property+</h1>
        <p className="mt-2 text-muted-foreground">
          Enterprise property management platform — monorepo is ready for development.
        </p>
      </div>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </main>
  );
}

export default App;
