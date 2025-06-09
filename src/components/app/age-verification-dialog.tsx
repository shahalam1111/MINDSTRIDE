
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface AgeVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgeVerificationDialog({ open, onOpenChange }: AgeVerificationDialogProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  const handleProceed = () => {
    if (isConfirmed) {
      onOpenChange(false);
      router.push('/register');
    } else {
      toast({
        title: "Age Confirmation Required",
        description: "Please confirm you are 18 or older to proceed.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Age Verification</AlertDialogTitle>
          <AlertDialogDescription>
            This platform is intended for individuals aged 18 and older. Please confirm your age to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 my-4">
          <Checkbox
            id="age-confirmation"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            aria-label="Confirm I am 18 or older"
          />
          <Label htmlFor="age-confirmation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I confirm I am 18 years of age or older.
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setIsConfirmed(false); onOpenChange(false); }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleProceed} disabled={!isConfirmed}>
            Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
