    // components/copy-button.jsx
    'use client';

    import { Button } from '@/components/ui/button';
    import { ClipboardCopy } from 'lucide-react';
    import { toast } from 'sonner';

    export default function CopyButton({ textToCopy, label }) {
      const handleClick = () => {
        try {
          // Create a temporary textarea element to copy text from
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed'; // Avoid scrolling to bottom
          textarea.style.opacity = '0'; // Make it invisible
          document.body.appendChild(textarea);
          textarea.select(); // Select the text
          document.execCommand('copy'); // Execute copy command
          document.body.removeChild(textarea); // Remove the temporary element
          toast.success(`${label} copied to clipboard!`);
        } catch (err) {
          console.error('Failed to copy text: ', err);
          toast.error(`Failed to copy ${label}.`);
        }
      };

      return (
        <Button onClick={handleClick} variant="outline" size="sm">
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy {label.split(' ')[0]}
        </Button>
      );
    }
    