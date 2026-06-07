export interface TransactionSearchRequest {
  trackingNumber?: string;
  rrn?: number;
  status?: number;
  amountFrom?: number;
  amountTo?: number;
  fromDate?: string;
  toDate?: string;
  transactionType?: string;
  merchantId?: string;

  pageNumber: number;
  pageSize: number;

  sortField?: string;
  sortDirection?: string;
}
