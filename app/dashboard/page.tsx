"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CompetitionList } from "@/components/competition-list";
import { CreateCompetitionDialog } from "@/components/create-competition-dialog";
import { Button } from "@/components/ui/button";
import { useCompetitions } from "@/src/features/dashboard/hooks";

export default function DashboardPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: competitions = [], isLoading, error } = useCompetitions();

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">
            Błąd podczas ładowania zawodów
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Wystąpił nieznany błąd'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-muted-foreground mt-2">
          Zarządzaj swoimi zawodami wędkarskimi
        </p>
      </div>

      <CompetitionList competitions={competitions} isLoading={isLoading} />

      {/* Create Competition Dialog */}
      <CreateCompetitionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Utwórz zawody</span>
      </Button>
    </div>
  );
}