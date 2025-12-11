"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Users } from "lucide-react";
import { CompetitionDTO } from "@/src/features/dashboard/schemas";
import { CompetitionStatus } from "@/src/types/database.types";

interface CompetitionCardProps {
  competition: CompetitionDTO;
}

function getStatusBadgeVariant(status: CompetitionStatus) {
  switch (status) {
    case 'PLANNED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'FINISHED':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: CompetitionStatus) {
  switch (status) {
    case 'PLANNED':
      return 'Planowane';
    case 'IN_PROGRESS':
      return 'W trakcie';
    case 'FINISHED':
      return 'Zakończone';
    default:
      return status;
  }
}

function getNavigationPath(competition: CompetitionDTO) {
  switch (competition.status) {
    case 'PLANNED':
      return `/competitions/${competition.id}/participants`;
    case 'IN_PROGRESS':
      return `/competitions/${competition.id}/leaderboard`;
    case 'FINISHED':
      return `/competitions/${competition.id}/leaderboard`;
    default:
      return `/competitions/${competition.id}`;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const navigationPath = getNavigationPath(competition);

  return (
    <Link href={navigationPath} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold leading-tight">
              {competition.name}
            </CardTitle>
            <Badge variant={getStatusBadgeVariant(competition.status)}>
              {getStatusLabel(competition.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            {formatDate(competition.date)}
          </div>
          <div className="text-sm text-muted-foreground">
            <Target className="w-4 h-4 inline mr-1" />
            {competition.pegs_count} stanowisk
          </div>
          {competition.participants_count !== undefined && (
            <div className="text-sm text-muted-foreground">
              <Users className="w-4 h-4 inline mr-1" />
              {competition.participants_count} uczestników
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
