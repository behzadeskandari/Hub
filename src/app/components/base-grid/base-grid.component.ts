import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  GridOptions
} from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { catchError, of, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-base-grid',
  templateUrl: './base-grid.component.html',
  styleUrls: ['./base-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,
    AgGridAngular]
})
export class BaseGridComponent implements OnInit, AfterViewInit {

  @ViewChild('agGrid') agGrid!: AgGridAngular;

  @Input() apiUrl: string = '/api/Report/GetAll';
  @Input() columnDefsOverride?: ColDef[];
  @Input() useSearch = true;
  @Input() searchModel: any;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  loading = true;
  error = false;
  totalCount: any = 0;
  currentPage = 1;
  pageSize = 20;


  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  };

  gridOptions: GridOptions = {
    pagination: false,
    // paginationPageSize: 20,
    // paginationPageSizeSelector: [10, 20, 50, 100],
    rowSelection: { mode: 'multiRow' },     // Community compatible
    suppressRowClickSelection: false,
  };



  constructor(private http: HttpClient) {

  }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.updateGridHeight();
    this.loadData();
  }

  gridHeight = 400;
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }


  loadData(page = 1, pageSize = this.pageSize): void {
    this.loading = true;
    this.error = false;

    const url = `${this.apiUrl}?Page=${page}&PageSize=${pageSize}`;
      this.getAllData(page, pageSize);


    // this.http.get<any>(url).subscribe({
    //   next: (res) => {
    //     this.rowData = res.items || [];
    //     this.totalCount = res.totalCount;
    //     this.loading = false;

    //     this.currentPage = page;
    //     this.updateGridHeight();

    //     if (this.columnDefs.length === 0 && this.rowData.length > 0) {
    //       this.generateColumns(this.rowData);
    //     }
    //   },
    //   error: () => {
    //     this.error = true;
    //     this.loading = false;
    //     this.rowData = [];
    //   }
    // });

  }

  loadSearch(page = 1, pageSize = this.pageSize){
    this.searchData(page, pageSize);
  }
  private getAllData(page: number, pageSize: number): void {
    const url = `${this.apiUrl}?Page=${page}&PageSize=${pageSize}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.rowData = res.items || [];
        this.totalCount = res.totalCount;
        this.currentPage = page;
        this.loading = false;
        this.updateGridHeight();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private searchData(page: number, pageSize: number): void {
    const payload = {
      ...this.searchModel,
      pageNumber: page,
      pageSize: pageSize
    };

    this.http.post<any>(`${this.apiUrl}/search`, payload)
      .subscribe({
        next: (res) => {
          this.rowData = res.items || [];
          this.totalCount = res.totalCount;
          this.currentPage = page;
          this.loading = false;
          this.updateGridHeight();
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }
  private updateGridHeight(): void {
    const rowHeight = 42; // matches your AG Grid row height
    const headerHeight = 44;

    const maxVisibleRows = this.pageSize;

    this.gridHeight = headerHeight + (maxVisibleRows * rowHeight) + 5;
  }
  private formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private getValueFormatter(key: string) {
    const lower = key.toLowerCase();
    if (lower.includes('date') || lower.includes('transaction')) {
      return (params: any) => params.value ? new Date(params.value).toLocaleString('fa-IR') : '';
    }
    if (lower.includes('amount')) {
      return (params: any) => params.value ? Number(params.value).toLocaleString('fa-IR') : '';
    }
    return undefined;
  }

  protected generateColumns(data: any[]): void {
    if (this.columnDefsOverride?.length) {
      this.columnDefs = [...this.columnDefsOverride];
      return;
    }

    const sample = data[0];
    this.columnDefs = Object.keys(sample).map(key => ({
      field: key,
      headerName: this.formatHeader(key),
      valueFormatter: this.getValueFormatter(key)
    }));
  }

 onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateGridHeight();
    this.loadData(this.currentPage, this.pageSize);
  }

  onGridReady(params: any): void {
    params.api.sizeColumnsToFit();
    // initial load
    this.loadData(this.currentPage, this.pageSize);
  }

  onPaginationChanged(event: any): void {
    const api = event.api;

    const page = api.paginationGetCurrentPage() + 1;

    if (page === this.currentPage) return; // 🔥 prevent loop

    this.currentPage = page;

    this.loadData(page, this.pageSize);
  }
  nextPage(): void {
    const maxPage = Math.ceil(this.totalCount / this.pageSize);

    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.loadData(this.currentPage, this.pageSize);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData(this.currentPage, this.pageSize);
    }
  }


}
