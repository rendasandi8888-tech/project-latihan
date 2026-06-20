import { User, Mail, ShieldCheck, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    role: "Patient",
    hospital: "Monad Medical Center",
    wallet: "0x1234...89AB",
    verified: true,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Full Name
              </p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Email
              </p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Role
            </p>

            <Badge>{user.role}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Hospital
            </p>

            <p className="font-medium">
              {user.hospital}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Identity</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />

            <div>
              <p className="text-sm text-muted-foreground">
                Wallet Address
              </p>

              <p className="font-mono text-sm">
                {user.wallet}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5" />

            <div>
              <p className="text-sm text-muted-foreground">
                Verification Status
              </p>

              <Badge variant="default">
                {user.verified
                  ? "Verified"
                  : "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}