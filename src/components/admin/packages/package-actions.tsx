"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

type PackageActionsProps = {
  pkg: {
    id: string;
    isActive: boolean;
  };
};

export function PackageActions({ pkg }: PackageActionsProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function toggleStatus() {
    setIsProcessing(true);
    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: pkg.isActive ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: pkg.isActive ? undefined : JSON.stringify({ isActive: true }),
    });
    setIsProcessing(false);
    if (!response.ok) return;

    notify(`Package ${pkg.isActive ? "deactivated" : "activated"}`);
    setOpenConfirm(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/admin/packages/${pkg.id}/edit`}>
          <Button size="sm" variant="secondary">
            Edit
          </Button>
        </Link>
        <Button
          size="sm"
          variant={pkg.isActive ? "danger" : "primary"}
          onClick={() => setOpenConfirm(true)}
        >
          {pkg.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={toggleStatus}
        title={`${pkg.isActive ? "Deactivate" : "Activate"} package`}
        description="This changes package availability for users."
        confirmLabel={pkg.isActive ? "Deactivate" : "Activate"}
        isProcessing={isProcessing}
      />
    </>
  );
}
