
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AgentIntervention } from "@/types";
import { InterventionCard } from "./InterventionCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 9;

export function InterventionList() {
  const interventions = useAppStore((state) => state.interventions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Apply filters
  const filteredInterventions = interventions.filter((intervention) => {
    // Search query filter
    const matchesSearch =
      intervention.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.reasoning.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || intervention.status === statusFilter;

    // Type filter
    const matchesType =
      typeFilter === "all" || intervention.agentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort by timestamp (newest first)
  const sortedInterventions = [...filteredInterventions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedInterventions.length / ITEMS_PER_PAGE);
  const pagedInterventions = sortedInterventions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Go to page helper
  const gotoPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interventions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="schema">Schema</SelectItem>
              <SelectItem value="job">Job</SelectItem>
              <SelectItem value="latency">Latency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pagedInterventions.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground">No interventions found matching your criteria.</p>
        </div>
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pagedInterventions.map((intervention) => (
              <InterventionCard
                key={intervention.id}
                intervention={intervention}
              />
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => gotoPage(page - 1)}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      isActive={page === idx + 1}
                      onClick={() => gotoPage(idx + 1)}
                      href="#"
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => gotoPage(page + 1)}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
