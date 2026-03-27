'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Lead, LeadStatus } from '../types';
import { LeadCard } from './lead-card';
import { LeadColumnHeader, columnConfig } from './lead-column-header';
import { useBulkUpdateLeads } from '../api/use-bulk-update-leads';

const columns: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.PROPOSAL,
  LeadStatus.NEGOTIATION,
  LeadStatus.CLOSED_WON,
  LeadStatus.CLOSED_LOST,
];

type LeadState = { [key in LeadStatus]: Lead[] };

interface LeadsKanbanProps {
  data: Lead[];
}

const columnBg: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-sky-50/60 border-sky-200/60',
  [LeadStatus.CONTACTED]: 'bg-violet-50/60 border-violet-200/60',
  [LeadStatus.QUALIFIED]: 'bg-amber-50/60 border-amber-200/60',
  [LeadStatus.PROPOSAL]: 'bg-blue-50/60 border-blue-200/60',
  [LeadStatus.NEGOTIATION]: 'bg-orange-50/60 border-orange-200/60',
  [LeadStatus.CLOSED_WON]: 'bg-emerald-50/60 border-emerald-200/60',
  [LeadStatus.CLOSED_LOST]: 'bg-slate-50/60 border-slate-200/60',
};

export const LeadsKanban = ({ data }: LeadsKanbanProps) => {
  const { mutate: bulkUpdate } = useBulkUpdateLeads();

  const [leads, setLeads] = useState<LeadState>(() => {
    const initial = Object.fromEntries(columns.map((c) => [c, []])) as unknown as LeadState;
    data.forEach((lead) => initial[lead.status].push(lead));
    columns.forEach((c) => initial[c].sort((a, b) => a.position - b.position));
    return initial;
  });

  useEffect(() => {
    const next = Object.fromEntries(columns.map((c) => [c, []])) as unknown as LeadState;
    data.forEach((lead) => next[lead.status].push(lead));
    columns.forEach((c) => next[c].sort((a, b) => a.position - b.position));
    setLeads(next);
  }, [data]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const { source, destination } = result;
      const srcStatus = source.droppableId as LeadStatus;
      const dstStatus = destination.droppableId as LeadStatus;

      let updatesPayload: { $id: string; status: LeadStatus; position: number }[] = [];

      setLeads((prev) => {
        const next = { ...prev };
        const srcCol = [...next[srcStatus]];
        const [moved] = srcCol.splice(source.index, 1);
        if (!moved) return prev;

        const updatedMoved = srcStatus !== dstStatus ? { ...moved, status: dstStatus } : moved;
        next[srcStatus] = srcCol;

        const dstCol = [...next[dstStatus]];
        dstCol.splice(destination.index, 0, updatedMoved);
        next[dstStatus] = dstCol;

        updatesPayload = [];
        updatesPayload.push({
          $id: updatedMoved.$id,
          status: dstStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        dstCol.forEach((lead, idx) => {
          if (lead && lead.$id !== updatedMoved.$id) {
            const newPos = Math.min((idx + 1) * 1000, 1_000_000);
            if (lead.position !== newPos) updatesPayload.push({ $id: lead.$id, status: dstStatus, position: newPos });
          }
        });

        if (srcStatus !== dstStatus) {
          srcCol.forEach((lead, idx) => {
            if (lead) {
              const newPos = Math.min((idx + 1) * 1000, 1_000_000);
              if (lead.position !== newPos) updatesPayload.push({ $id: lead.$id, status: srcStatus, position: newPos });
            }
          });
        }

        return next;
      });

      bulkUpdate({ json: { leads: updatesPayload } });
    },
    [bulkUpdate]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-x-3 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map((status) => (
          <div
            key={status}
            className={cn(
              'flex-shrink-0 w-[280px] rounded-xl border flex flex-col',
              columnBg[status]
            )}
          >
            <LeadColumnHeader status={status} count={leads[status].length} />
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    'flex-1 p-2.5 flex flex-col gap-y-2.5 min-h-[120px] transition-colors duration-150 rounded-b-xl',
                    snapshot.isDraggingOver && 'bg-white/50'
                  )}
                >
                  {leads[status].map((lead, index) => (
                    <Draggable key={lead.$id} draggableId={lead.$id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'transition-transform duration-150',
                            snapshot.isDragging && 'rotate-1 scale-[1.02] shadow-xl'
                          )}
                        >
                          <LeadCard lead={lead} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {leads[status].length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className={cn('text-xs font-medium opacity-40', columnConfig[status].color)}>
                        No leads
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
