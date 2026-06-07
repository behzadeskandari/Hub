import { AfterViewInit,Component, ViewChild, } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { BaseGridComponent } from "../../../components/base-grid/base-grid.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionSearchRequest } from '../../../models/transactionSearchRequest';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  standalone: true,
  imports: [BaseGridComponent,ReactiveFormsModule]
})
export class ReportComponent implements AfterViewInit {

@ViewChild(BaseGridComponent) grid!: BaseGridComponent;


ngAfterViewInit(): void {
  this.grid.searchModel = this.searchModel;
  this.grid.loadData(1, this.searchModel.pageSize);
}
search() {

 const formValue = this.searchForm.value;

  // push form values into grid
  this.grid.searchModel = {
    ...this.grid.searchModel,
    ...formValue
  };

  // reset page
  this.grid.currentPage = 1;

  // trigger load
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

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      trackingNumber: [null],
      rrn: [null],
      status: [null]
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


  customColumns: ColDef[] = [
    { field: 'source', headerName: 'Source', filter: 'agTextColumnFilter' },
    { field: 'trackingNumber', headerName: 'Tracking Number', minWidth: 200 },
    { field: 'rrn', headerName: 'RRN' },
    {
      field: 'amount',
      headerName: 'Amount',
      valueFormatter: params => params.value?.toLocaleString() + ' IRR' // or whatever currency
    },
    { field: 'status', headerName: 'Status' },
    {
      field: 'transactionDate',
      headerName: 'Transaction Date',
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString() : ''
    },
    { field: 'approvalCode', headerName: 'Approval Code', minWidth: 180 }
  ];
}
