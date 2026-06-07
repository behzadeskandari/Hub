import { AfterViewInit, Component, ViewChild, } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { BaseGridComponent } from "../../../components/base-grid/base-grid.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionSearchRequest } from '../../../models/transactionSearchRequest';
import moment from 'jalali-moment';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  standalone: true,
  imports: [BaseGridComponent, ReactiveFormsModule, NgPersianDatepickerModule]
})
export class ReportComponent implements AfterViewInit {

  @ViewChild(BaseGridComponent) grid!: BaseGridComponent;

  fromDatePersian: string = '';
  toDatePersian: string = '';
  loading!: boolean;



  ngAfterViewInit(): void {
    this.grid.searchModel = this.searchModel;
    this.grid.loadData(1, this.searchModel.pageSize);
  }



  openPicker(type: 'from' | 'to') {
    const date = new Date();

    const jalali = moment(date).format('jYYYY/jMM/jDD');

    if (type === 'from') {
      this.fromDatePersian = jalali;
    } else {
      this.toDatePersian = jalali;
    }
  }
  search() {

    const formValue = this.searchForm.getRawValue();

    this.searchModel = {
      ...formValue,
      fromDate: this.fromDatePersian
        ? moment(this.fromDatePersian, 'jYYYY/jMM/jDD').toDate()
        : null,

      toDate: this.toDatePersian
        ? moment(this.toDatePersian, 'jYYYY/jMM/jDD').toDate()
        : null,
      pageNumber: 1,
      pageSize: this.grid.pageSize,
      sortField: 'transactionDate',
      sortDirection: 'desc'
    };

    this.grid.searchModel = this.searchModel;
    this.grid.currentPage = 1;

    this.grid.loadSearch(1, this.grid.pageSize);
  }
  searchForm!: FormGroup;
  apiUrl = 'api/Report/GetAll';
  searchModel: TransactionSearchRequest = {
    pageNumber: 1,
    pageSize: 10,
    sortField: 'transactionDate',
    sortDirection: 'desc'
  };

  constructor(private fb: FormBuilder, private http: HttpClient) {

    this.searchForm = this.fb.group({
      trackingNumber: [''],
      rrn: [''],
      status: [null],

      amountFrom: [null],
      amountTo: [null],

      fromDate: [null],
      toDate: [null],

      transactionType: [''],
      merchantId: ['']
    });
  }
  resetFilters(): void {
    this.searchForm.reset();

    this.grid.searchModel = {
      pageNumber: 1,
      pageSize: this.grid.pageSize,
      sortField: 'transactionDate',
      sortDirection: 'desc'
    };

    this.grid.loadData(1, this.grid.pageSize);
  }

  exportToExcel(): void {
    this.loading = true;
    this.http.get(`api/Report/export/excel`, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          this.downloadFile(blob, 'report.xlsx');
          this.loading = false;
        },
        error: (err) => {
          console.error('Export Excel failed', err);
          this.loading = false;
          alert('خطا در خروجی اکسل');
        }
      });
  }

  exportToPdf(): void {
    this.loading = true;
    this.http.get(`api/Report/export/pdf`, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          this.downloadFile(blob, 'report.pdf');
          this.loading = false;
        },
        error: (err) => {
          console.error('Export PDF failed', err);
          this.loading = false;
          alert('خطا در خروجی PDF');
        }
      });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }


  customColumns: ColDef[] = [
    {
      //Source
      field: 'source', headerName: 'مبدا',
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const statusMap: any = {
          "نگه دارنده": { text: "نگه دارنده", class: 'badge-pending' },
          "واریز کننده": { text: "واریز کننده", class: 'badge-success' },
        };

        const value = statusMap[params.value] || { text: params.value, class: '' };

        return `
                <span class="status-badge ${value.class}">
                  ${value.text}
                </span>
               `;
      },
    },
    { field: 'trackingNumber', headerName: 'شمالی پیگیری', minWidth: 200 },
    { field: 'rrn', headerName: 'RRN' },
    {
      field: 'amount',
      headerName: 'مبلغ (ریال)',
      valueFormatter: params => params.value?.toLocaleString('fa-IR') + ' ریال  '     // or whatever currency
    },
    {
      field: 'status',
      headerName: 'وضعیت',
      cellRenderer: (params: any) => {
        const statusMap: any = {
          0: { text: 'در انتظار', class: 'badge-pending' },
          1: { text: 'موفق', class: 'badge-success' },
          2: { text: 'ناموفق', class: 'badge-failed' },
        };

        const value = statusMap[params.value] || { text: params.value, class: '' };

        return `
                <span class="status-badge ${value.class}">
                  ${value.text}
                </span>
               `;
      }


    },
    {
      field: 'transactionDate',
      headerName: 'تاریخ تراکنش',
      valueFormatter: params =>
        params.value
          ? new Date(params.value).toLocaleString('fa-IR')
          : ''
    },
    { field: 'approvalCode', headerName: 'کد تأیید', minWidth: 180 }
  ];
}
