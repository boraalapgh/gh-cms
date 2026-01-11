/**
 * New Certificate Page
 *
 * Full-screen certificate designer for creating new certificate templates.
 * Includes save functionality to persist templates to the database.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CertificateDesigner } from "@/components/certificates";
import { CertificateTemplate } from "@/types";

export default function NewCertificatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (template: CertificateTemplate) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          template,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to the certificate list or editor
        router.push(`/certificates/${result.data.id}`);
      } else {
        console.error("Failed to save certificate:", result.error);
        alert("Failed to save certificate. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save certificate:", error);
      alert("Failed to save certificate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (template: CertificateTemplate) => {
    // Export as JSON file for backup
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name || "certificate"}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen">
      <CertificateDesigner onSave={handleSave} onExport={handleExport} />
    </div>
  );
}
