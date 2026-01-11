/**
 * Edit Certificate Page
 *
 * Full-screen certificate designer for editing existing certificate templates.
 * Loads template from database and saves updates.
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CertificateDesigner } from "@/components/certificates";
import { CertificateTemplate } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/certificates/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          setTemplate(result.data.template);
        } else {
          setError(result.error || "Failed to load certificate template");
        }
      } catch (err) {
        console.error("Failed to load certificate:", err);
        setError("Failed to load certificate template");
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplate();
  }, [resolvedParams.id]);

  const handleSave = async (updatedTemplate: CertificateTemplate) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/certificates/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedTemplate.name,
          template: updatedTemplate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setTemplate(result.data.template);
        alert("Certificate saved successfully!");
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

  const handleExport = (templateData: CertificateTemplate) => {
    // Export as JSON file for backup
    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateData.name || "certificate"}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Loading certificate template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Certificate template not found"}</p>
          <button
            onClick={() => router.push("/certificates/new")}
            className="text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            Create New Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <CertificateDesigner
        initialTemplate={template}
        onSave={handleSave}
        onExport={handleExport}
      />
    </div>
  );
}
