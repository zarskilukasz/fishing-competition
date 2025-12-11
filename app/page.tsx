import Link from "next/link";
import { Fish, Trophy, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-10">
            System zawodów wędkarskich
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Profesjonalne narzędzie dla organizatorów zawodów wędkarskich.
            Automatyzuj proces sędziowania i zarządzaj zawodami w czasie rzeczywistym.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <Link
            href="/login"
            className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary px-8 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-48"
          >
            Zaloguj się
          </Link>
          <Link
            href="/register"
            className="inline-flex h-14 w-full items-center justify-center rounded-lg border border-border bg-secondary px-8 text-lg font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-48"
          >
            Dołącz do nas
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
          <div className="flex flex-col items-center">
            <Fish className="mb-4 h-12 w-12 text-primary" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Rejestruj połowy
            </h3>
            <p className="text-muted-foreground text-center">
              Łatwe wprowadzanie wyników ważenia przez sędziów podczas zawodów
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Trophy className="mb-4 h-12 w-12 text-primary" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Rankingi na żywo
            </h3>
            <p className="text-muted-foreground text-center">
              Automatyczne generowanie i aktualizacja rankingów w czasie rzeczywistym
            </p>
          </div>
          <div className="flex flex-col items-center">
            <FileText className="mb-4 h-12 w-12 text-primary" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Raporty i eksport
            </h3>
            <p className="text-muted-foreground text-center">
              Generowanie czytelnych raportów PDF z wynikami zawodów
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
