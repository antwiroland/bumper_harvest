"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

type UserActionsProps = {
  userId: string;
  currentRole: Role;
};

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [role, setRole] = useState<Role>(currentRole);
  const [openSuspend, setOpenSuspend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function updateRole(nextRole: Role) {
    setIsSubmitting(true);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setIsSubmitting(false);

    if (!response.ok) return;

    notify("User role updated");
    router.refresh();
  }

  async function suspendUser() {
    setIsSubmitting(true);
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setIsSubmitting(false);

    if (!response.ok) return;

    notify("User suspended");
    setOpenSuspend(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={role}
          onChange={(event) => {
            const nextRole = event.target.value as Role;
            setRole(nextRole);
            void updateRole(nextRole);
          }}
          disabled={isSubmitting}
          className="h-9 w-28"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </Select>
        <Button
          size="sm"
          variant="danger"
          onClick={() => setOpenSuspend(true)}
          disabled={isSubmitting || role === "ADMIN"}
        >
          Suspend
        </Button>
      </div>

      <ConfirmDialog
        open={openSuspend}
        onClose={() => setOpenSuspend(false)}
        onConfirm={suspendUser}
        title="Suspend user account"
        description="This action signs the user out and blocks access."
        confirmLabel="Suspend"
        isProcessing={isSubmitting}
      />
    </>
  );
}
