export interface TransactionSearchRequest {
  trackingNumber?: string;
  rrn?: number;
  status?: number;
  amountFrom?: number | null;
  amountTo?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
  transactionType?: string | null;
  merchantId?: string | null;

  pageNumber: number;
  pageSize: number;

  sortField?: string;
  sortDirection?: string;
}
