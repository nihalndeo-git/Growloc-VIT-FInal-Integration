"use client";

import { useCallback, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Upload } from "lucide-react";

export type AnalyzeResult = {
  canopyHeight: number;
  canopyWidth: number;
  canopyArea: number;
};

export function PlantDashboard() {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setError(null);
      setResult(null);
      if (!file) {
        setPendingFile(null);
        setFileName(null);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        return;
      }
      setPendingFile(file);
      setFileName(file.name);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    },
    [],
  );

  const analyze = useCallback(async () => {
    if (!pendingFile) {
      setError("Choose an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", pendingFile);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as AnalyzeResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Is the Next.js server running?");
    } finally {
      setLoading(false);
    }
  }, [pendingFile]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="size-8 text-emerald-600" aria-hidden />
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Growloc
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Upload a plant image to compute canopy metrics. The AI service uses a
          mock model today; swap in real inference without changing this UI.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle>Upload</CardTitle>
            <CardDescription>
              Select a photo, preview it, then run analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-foreground"
              >
                Image
              </label>
              <Input
                id={inputId}
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
              {fileName ? (
                <p className="text-muted-foreground text-xs">{fileName}</p>
              ) : null}
            </div>

            {previewUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic blob / MinIO URLs */}
                <img
                  src={previewUrl}
                  alt="Selected plant preview"
                  className="size-full object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground">
                No image selected
              </div>
            )}

            <Button
              type="button"
              onClick={analyze}
              disabled={loading || !pendingFile}
              className="w-full sm:w-auto"
            >
              <Upload className="size-4" data-icon="inline-start" />
              {loading ? "Analyzing…" : "Analyze plant"}
            </Button>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <CardDescription>
              Canopy dimensions from the AI service (mock values for now).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {result ? (
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-3">
                  <dt className="text-muted-foreground">Canopy height</dt>
                  <dd className="font-mono text-lg font-medium tabular-nums">
                    {result.canopyHeight.toFixed(3)} m
                  </dd>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <dt className="text-muted-foreground">Canopy width</dt>
                  <dd className="font-mono text-lg font-medium tabular-nums">
                    {result.canopyWidth.toFixed(3)} m
                  </dd>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <dt className="text-muted-foreground">Canopy area</dt>
                  <dd className="font-mono text-lg font-medium tabular-nums">
                    {result.canopyArea.toFixed(3)} m²
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground text-sm">
                Metrics appear here after a successful run.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
