"use client";

import Link from "next/link";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-semibold hover:text-primary cursor-pointer transition-colors">
              Dashboard
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
