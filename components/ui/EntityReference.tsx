"use client";

import type { ButtonHTMLAttributes } from "react";
import { useEntityNavigation } from "@/hooks/useEntityNavigation";
import type { EntityType } from "@/types/domain";

interface EntityReferenceProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type"> {
  entityType: EntityType;
  entityId: string;
}

export function EntityReference({ entityType, entityId, className, children, ...props }: EntityReferenceProps) {
  const { openEntity } = useEntityNavigation();
  return <button {...props} className={className} type="button" onClick={() => openEntity(entityType, entityId)}>{children}</button>;
}
