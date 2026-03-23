import { Button } from "@/components/ui/button";

export function SocialAuth() {
  return (
    <div className="space-y-2">
      <Button variant="secondary" className="w-full" disabled>
        Continue with Google (Coming soon)
      </Button>
      <Button variant="secondary" className="w-full" disabled>
        Continue with Apple (Coming soon)
      </Button>
    </div>
  );
}
