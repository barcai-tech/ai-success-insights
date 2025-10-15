/**
 * Accounts Table Component
 * Displays filterable, sortable, paginated list of accounts
 */

"use client";

import { memo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { getHealthBadgeVariant } from "@/utils/helpers";
import type { Account } from "@/models";

type SortField = "name" | "segment" | "health_bucket" | "arr";
type SortOrder = "asc" | "desc";

interface AccountsTableProps {
  accounts: Account[];
  totalAccounts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sortField: SortField;
  sortOrder: SortOrder;
  healthFilter: string | null;
  segmentFilter: string | null;
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onClearFilters: () => void;
}

export const AccountsTable = memo(function AccountsTable({
  accounts,
  totalAccounts,
  totalPages,
  currentPage,
  pageSize,
  sortField,
  sortOrder,
  healthFilter,
  segmentFilter,
  onSort,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
}: AccountsTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const hasFilters = healthFilter || segmentFilter;
  const filteredCount = accounts.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>All Accounts</CardTitle>
            <CardDescription>
              {!hasFilters
                ? `${totalAccounts} total accounts`
                : `${filteredCount} of ${totalAccounts} accounts`}
            </CardDescription>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center hover:text-primary transition-colors"
                    onClick={() => onSort("name")}
                  >
                    Account Name
                    {getSortIcon("name")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center hover:text-primary transition-colors"
                    onClick={() => onSort("segment")}
                  >
                    Segment
                    {getSortIcon("segment")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center hover:text-primary transition-colors"
                    onClick={() => onSort("health_bucket")}
                  >
                    Health
                    {getSortIcon("health_bucket")}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    className="flex items-center ml-auto hover:text-primary transition-colors"
                    onClick={() => onSort("arr")}
                  >
                    ARR
                    {getSortIcon("arr")}
                  </button>
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No accounts match your filters
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell>{account.segment}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getHealthBadgeVariant(account.health_bucket)}
                      >
                        {account.health_bucket}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(account.arr)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/accounts/${account.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
