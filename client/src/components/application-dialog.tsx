import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, ValidationError } from '@formspree/react';

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formSubmitted: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  formType: 'open' | 'job';
  jobTitle?: string;
}

export default function ApplicationDialog({
  open,
  onOpenChange,
  title,
  description,
  formSubmitted: initialFormSubmitted,
  onSubmit,
  onClose,
  formType,
  jobTitle
}: ApplicationDialogProps) {
  // Use Formspree's React hook
  const [formState, handleFormspreeSubmit] = useForm("xdkgqqvk");
  
  // Determine if the form is submitted based on either the prop or Formspree's state
  const isSubmitted = initialFormSubmitted || formState.succeeded;
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form is being submitted to Formspree via React SDK");
    
    // Submit the form using Formspree's handler
    await handleFormspreeSubmit(e);
    
    // Call the parent component's onSubmit handler to update UI state
    onSubmit(e);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded text-center">
            <h3 className="font-bold text-lg mb-2">Application Submitted!</h3>
            <p>Thank you for your interest in joining SkillSwap. We've received your application and will review it shortly.</p>
            <p className="mt-4">We'll be in touch if your profile matches our current needs.</p>
            <Button 
              className="mt-4" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formType === 'job' && (
              <input 
                type="hidden" 
                name="job_position" 
                value={jobTitle || 'Unknown Position'} 
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${formType}_firstName`}>First Name</Label>
                <Input id={`${formType}_firstName`} name="firstName" required />
                <ValidationError prefix="First Name" field="firstName" errors={formState.errors} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formType}_lastName`}>Last Name</Label>
                <Input id={`${formType}_lastName`} name="lastName" required />
                <ValidationError prefix="Last Name" field="lastName" errors={formState.errors} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${formType}_email`}>Email</Label>
              <Input id={`${formType}_email`} name="email" type="email" required />
              <ValidationError prefix="Email" field="email" errors={formState.errors} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${formType}_phone`}>Phone Number</Label>
              <Input id={`${formType}_phone`} name="phone" type="tel" />
              <ValidationError prefix="Phone" field="phone" errors={formState.errors} />
            </div>
            
            {formType === 'open' && (
              <div className="space-y-2">
                <Label htmlFor="position">Position of Interest</Label>
                <Input id="position" name="position" placeholder="What role are you interested in?" required />
                <ValidationError prefix="Position" field="position" errors={formState.errors} />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={`${formType}_skills`}>Key Skills</Label>
              <Input id={`${formType}_skills`} name="skills" placeholder="Separate skills with commas" required />
              <ValidationError prefix="Skills" field="skills" errors={formState.errors} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${formType}_message`}>
                {formType === 'job' 
                  ? 'Why are you a good fit for this role?' 
                  : 'Why do you want to join SkillSwap?'}
              </Label>
              <Textarea 
                id={`${formType}_message`} 
                name="message" 
                placeholder={formType === 'job'
                  ? "Tell us why you're interested in this position and how your experience makes you a good fit..."
                  : "Tell us about your interest in SkillSwap and how you can contribute..."
                }
                rows={3}
                required
              />
              <ValidationError prefix="Message" field="message" errors={formState.errors} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${formType}_resume`}>Resume/CV Link</Label>
              <Input 
                id={`${formType}_resume`} 
                name="resume" 
                placeholder="Link to your resume (Google Drive, Dropbox, etc.)" 
                required
              />
              <ValidationError prefix="Resume" field="resume" errors={formState.errors} />
              <p className="text-xs text-gray-500 mt-1">
                Please provide a link to your resume hosted on Google Drive, Dropbox, or another file sharing service.
              </p>
            </div>
            
            <input type="hidden" name="_subject" value={formType === 'job' 
              ? `Application for ${jobTitle} Position` 
              : 'Open Application via SkillSwap Careers Page'
            } />
            
            {/* Show any form errors */}
            {formState.errors && Object.keys(formState.errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Please fix the errors above and try again.</p>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formState.submitting}
              >
                {formState.submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}