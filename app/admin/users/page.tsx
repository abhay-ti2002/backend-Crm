"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { users, tickets } from "@/lib/mockData";
import { format } from "date-fns";
import { Ticket, Users } from "lucide-react";
import Link from "next/link";

const avatarColors = [
  { bg: "bg-indigo-100 dark:bg-indigo-500/20",  text: "text-indigo-700 dark:text-indigo-400"  },
  { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-amber-100 dark:bg-amber-500/20",    text: "text-amber-700 dark:text-amber-400"    },
  { bg: "bg-rose-100 dark:bg-rose-500/20",      text: "text-rose-700 dark:text-rose-400"      },
  { bg: "bg-violet-100 dark:bg-violet-500/20",  text: "text-violet-700 dark:text-violet-400"  },
  { bg: "bg-sky-100 dark:bg-sky-500/20",        text: "text-sky-700 dark:text-sky-400"        },
  { bg: "bg-orange-100 dark:bg-orange-500/20",  text: "text-orange-700 dark:text-orange-400"  },
  { bg: "bg-teal-100 dark:bg-teal-500/20",      text: "text-teal-700 dark:text-teal-400"      },
  { bg: "bg-pink-100 dark:bg-pink-500/20",      text: "text-pink-700 dark:text-pink-400"      },
];

const COLS = "grid-cols-[1fr_1fr_16rem_9rem]";
const TH = "py-3 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-slate-100">Users</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {users.length} registered users
        </p>
      </div>

      {/* User list */}
      <Card className="flex-1 min-h-0 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No users found</p>
            </div>
          ) : (
            <>
              {/* Sticky header */}
              <div className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 shrink-0`}>
                <div className={`${TH} px-5`}>User</div>
                <div className={TH}>Email</div>
                <div className={TH}>Tickets</div>
                <div className={`${TH} text-right`}>Last Active</div>
              </div>

              {/* Scrollable rows */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:var(--color-slate-300)_transparent] dark:[scrollbar-color:var(--color-slate-700)_transparent]">
                {users.map((u, idx) => {
                  const userTickets = tickets.filter((t) => t.userId === u.id);
                  const color = avatarColors[idx % avatarColors.length];
                  return (
                    <div
                      key={u.id}
                      className={`grid ${COLS} border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-100`}
                    >
                      {/* User */}
                      <div className="py-3 px-5 flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className={`text-xs font-semibold ${color.bg} ${color.text}`}>
                            {u.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{u.name}</span>
                      </div>

                      {/* Email */}
                      <div className="py-3 px-4 flex items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{u.email}</span>
                      </div>

                      {/* Tickets */}
                      <div className="py-3 px-4 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums text-xs">
                            {u.ticketCount}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {userTickets.slice(0, 3).map((t) => (
                            <Link key={t.id} href={`/admin/tickets/${t.id}`}>
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 font-mono border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer"
                              >
                                {t.id}
                              </Badge>
                            </Link>
                          ))}
                          {userTickets.length > 3 && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                              +{userTickets.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Active */}
                      <div className="py-3 px-4 flex items-center justify-end">
                        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                          {format(new Date(u.lastActive), "MMM d, HH:mm")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
