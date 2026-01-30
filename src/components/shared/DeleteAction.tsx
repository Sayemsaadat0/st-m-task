"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

type DeleteActionProps = {
  handleDeleteSubmit: Function;
  isLoading?: boolean;
};

const DeleteAction: React.FC<DeleteActionProps> = ({
  handleDeleteSubmit,
  isLoading,
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await handleDeleteSubmit();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.errors && Array.isArray(err.errors)) {
        for (const key of err.errors) {
          console.error(key);
        }
      }
    }
  }, [handleDeleteSubmit]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer p-1 hover:bg-red-500/20 rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
      </div>
      <AlertDialogContent className="bg-t-black border border-t-gray/30 text-white max-w-xs p-4 sm:p-5 md:p-6">
        <AlertDialogTitle className="sr-only">
          Delete Confirmation
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-500/10 p-2 sm:p-3 rounded-full">
              <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500" />
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2">Are you sure?</h3>
            <p className="text-xs sm:text-sm text-white/60">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1 border-t-gray/30 text-white hover:bg-t-green/20"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAction;
