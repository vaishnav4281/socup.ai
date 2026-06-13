"use client";
import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/5 ${className}`}
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="panel p-5 space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function AlertSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-white/3 border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="flex items-center gap-4 p-2.5">
      <Skeleton className="h-3 w-24 shrink-0" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/2 border border-white/6">
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-14 shrink-0" />
      <Skeleton className="h-3 w-10 shrink-0" />
      <Skeleton className="h-3 w-14 shrink-0" />
      <Skeleton className="h-3 w-28 shrink-0 hidden md:block" />
    </div>
  );
}
