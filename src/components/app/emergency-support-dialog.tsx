
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, ExternalLink, ShieldAlert } from 'lucide-react';

interface EmergencySupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emergencyContacts = [
  { name: "National Suicide Prevention Lifeline", number: "988", website: "https://988lifeline.org/", description: "24/7, free and confidential support for people in distress, prevention and crisis resources." },
  { name: "Crisis Text Line", number: "Text HOME to 741741", website: "https://www.crisistextline.org/", description: "24/7, free, confidential crisis support via text." },
  { name: "The Trevor Project (LGBTQ Youth)", number: "1-866-488-7386", website: "https://www.thetrevorproject.org/", description: "Crisis intervention and suicide prevention services to lesbian, gay, bisexual, transgender, queer & questioning young people." },
];

const localResources = [
    { name: "Find Your Local NAMI", website: "https://www.nami.org/findsupport", description: "Find local support groups and resources through the National Alliance on Mental Illness." },
    { name: "SAMHSA National Helpline", number: "1-800-662-HELP (4357)", website: "https://www.samhsa.gov/find-help/national-helpline", description: "Treatment referral and information service for individuals and families facing mental and/or substance use disorders."},
];


export function EmergencySupportDialog({ open, onOpenChange }: EmergencySupportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-headline">
            <ShieldAlert className="h-7 w-7 mr-2 text-destructive" />
            Emergency & Crisis Support
          </DialogTitle>
          <DialogDescription className="pt-1">
            If you are in immediate danger, please call 911 or your local emergency number.
            The resources below are available for urgent support.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">National Hotlines & Text Lines</h3>
            <ul className="space-y-3">
              {emergencyContacts.map((contact) => (
                <li key={contact.name} className="p-3 bg-muted/50 rounded-md border">
                  <h4 className="font-semibold text-foreground">{contact.name}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{contact.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${contact.number.replace(/\D/g, '')}`} className="flex items-center">
                        <Phone className="h-4 w-4 mr-1.5" /> Call {contact.number}
                      </a>
                    </Button>
                    {contact.website && (
                      <Button variant="link" size="sm" asChild className="p-0 h-auto">
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary">
                          Visit Website <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
             <h3 className="text-lg font-semibold mb-2 text-foreground">Find Local Resources</h3>
             <ul className="space-y-3">
                {localResources.map((resource) => (
                 <li key={resource.name} className="p-3 bg-muted/50 rounded-md border">
                    <h4 className="font-semibold text-foreground">{resource.name}</h4>
                    <p className="text-sm text-muted-foreground mb-1">{resource.description}</p>
                     {resource.number && (
                        <Button variant="outline" size="sm" asChild className="mr-2 mt-1">
                        <a href={`tel:${resource.number.replace(/\D/g, '')}`} className="flex items-center">
                            <Phone className="h-4 w-4 mr-1.5" /> Call {resource.number}
                        </a>
                        </Button>
                    )}
                    {resource.website && (
                      <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                        <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary">
                          Visit Website <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    )}
                 </li>
                ))}
             </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Personal Safety Plan</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Consider creating a personal safety plan. This can include your warning signs, coping strategies,
              people to contact, and safe places.
            </p>
            <Button variant="secondary" asChild>
                <a href="https://www.sprc.org/resources-programs/safety-plan-template" target="_blank" rel="noopener noreferrer">
                    View Safety Plan Template <ExternalLink className="h-4 w-4 ml-1.5" />
                </a>
            </Button>
          </div>

        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
