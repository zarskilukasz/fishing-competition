"use client";

import { CompetitionCard } from "@/components/competition-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { CompetitionDTO } from "@/src/features/dashboard/schemas";

interface CompetitionListProps {
  competitions: CompetitionDTO[];
  isLoading: boolean;
}

function CompetitionCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function CompetitionList({ competitions, isLoading }: CompetitionListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CompetitionCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <Alert className="max-w-md">
          <Info/>
          <AlertTitle>Brak zawodów</AlertTitle>
          <AlertDescription>
            Nie masz jeszcze żadnych zawodów wędkarskich. Utwórz pierwsze zawody, aby zacząć.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}
    </div>
  );
}
