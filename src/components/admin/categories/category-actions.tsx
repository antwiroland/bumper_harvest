"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

type CategoryActionsProps = {
  category: {
    id: string;
    isActive: boolean;
  };
};

export function CategoryActions({ category }: CategoryActionsProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggleStatus() {
    setIsSubmitting(true);
    const response = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !category.isActive }),
    });
    setIsSubmitting(false);

    if (!response.ok) return;

    notify(`Category ${category.isActive ? "deactivated" : "activated"}`);
    setOpenConfirm(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/admin/categories/${category.id}/edit`}>
          <Button size="sm" variant="secondary">
            Edit
          </Button>
        </Link>
        <Button
          size="sm"
          variant={category.isActive ? "danger" : "primary"}
          onClick={() => setOpenConfirm(true)}
        >
          {category.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={toggleStatus}
        title={`${category.isActive ? "Deactivate" : "Activate"} category`}
        description="This will update category availability."
        confirmLabel={category.isActive ? "Deactivate" : "Activate"}
        isProcessing={isSubmitting}
      />
    </>
  );
}
