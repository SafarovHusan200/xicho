import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CustomModal = ({ open, onClose, title, description, children, className }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={className}
        onPointerDownOutside={(e) => e.preventDefault()}
        // onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={'text-xl'}>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;

{
  /* <CustomModal open={isOpen} onClose={() => setIsOpen(false)} title="Qurilma" className="max-w-2xl">
    content
</CustomModal>; */
}
