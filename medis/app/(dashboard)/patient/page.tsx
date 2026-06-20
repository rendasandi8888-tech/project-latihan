import {
  ShieldCheck,
  FileText,
  ScanLine,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const records = [
  {
    type: "CT Scan",
    bodyPart: "Brain",
    date: "2026-06-12",
    status: "Verified",
  },
  {
    type: "X-Ray",
    bodyPart: "Chest",
    date: "2026-05-28",
    status: "Verified",
  },
];

export default function PatientDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Good Morning, Patient
        </h1>

        <p className="text-muted-foreground">
          Access your medical imaging records securely.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Security</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />

          <div>
            <p className="font-medium">
              Your medical data is encrypted
            </p>

            <p className="text-sm text-muted-foreground">
              Protected and verified on Monad Testnet.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {records.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {record.type}
                </p>

                <p className="text-sm text-muted-foreground">
                  {record.bodyPart}
                </p>

                <p className="text-xs text-muted-foreground">
                  {record.date}
                </p>
              </div>

              <Badge>{record.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Examination Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5" />
              <span>CT Scan Completed</span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <span>X-Ray Completed</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Blockchain Verification Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}