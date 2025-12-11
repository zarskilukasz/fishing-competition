"use client";

import { CreateCompetitionForm } from "@/components/create-competition-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateCompetitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompetitionDialog({ open, onOpenChange }: CreateCompetitionDialogProps) {
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent onOpenAutoFocus={(event) => event.preventDefault()}>
          <DrawerHeader className="text-left">
            <DrawerTitle>Utwórz nowe zawody</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <CreateCompetitionForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Utwórz nowe zawody</DialogTitle>
        </DialogHeader>
        <CreateCompetitionForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
