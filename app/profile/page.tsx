"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileForm } from "@/components/profile-form";
import { User } from "@/src/types/user";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Ładowanie profilu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">
              Brak dostępu
            </h2>
            <p className="text-muted-foreground mt-2">
              Musisz być zalogowany, aby zobaczyć tę stronę.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileForm user={user} />;
}
