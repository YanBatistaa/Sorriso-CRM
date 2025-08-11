import { cn } from "@/lib/utils";
import React, { HTMLAttributes, forwardRef } from "react";

const KanbanBoard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex h-full w-full gap-4 overflow-x-auto p-1", // Adicionado padding para não cortar as sombras
        className
      )}
      {...props}
    />
  );
};

const KanbanColumnContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-80 flex-shrink-0 flex-col rounded-xl bg-muted/60 p-2", // Fundo da coluna e bordas arredondadas
          className
        )}
        {...props}
      />
    );
  }
);
KanbanColumnContainer.displayName = "KanbanColumnContainer";

const KanbanColumnHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("mb-3 flex items-center justify-between px-2", className)} {...props} />; // Adicionado padding horizontal
};

const KanbanColumnTitle = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
};

const KanbanCardContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-shadow hover:shadow-md", // Sombra sutil no card e ao passar o mouse
          className
        )}
        {...props}
      />
    );
  }
);
KanbanCardContainer.displayName = "KanbanCardContainer";

// Objeto principal que agrupa todos os componentes
export const Kanban = {
  Board: KanbanBoard,
  Column: KanbanColumnContainer,
  ColumnHeader: KanbanColumnHeader,
  ColumnTitle: KanbanColumnTitle,
  Card: KanbanCardContainer,
};