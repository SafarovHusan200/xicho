"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const events = {
  "2026-06-03": [
    {
      id: 1,
      title: "React darsi",
      description: "React hooks mavzusi",
    },
    {
      id: 2,
      title: "Meeting",
      description: "Loyiha muhokamasi",
    },
  ],
  "2026-06-05": [
    {
      id: 3,
      title: "Node.js darsi",
      description: "Express.js bilan API",
    },
  ],
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    if (!date) return;

    setSelectedDate(date);

    const dateKey = date.toLocaleDateString("en-CA");

    setSelectedEvents(events[dateKey] || []);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        className="rounded-md border"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {selectedEvents.length ? (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border p-3"
                >
                  <h3 className="font-semibold">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              ))
            ) : (
              <p>Bu sana uchun ma'lumot mavjud emas.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}