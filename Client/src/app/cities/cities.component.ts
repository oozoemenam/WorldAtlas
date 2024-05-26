import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../api-response.model';
import { MaterialModule } from '../material/material.module';
import { City } from './city.model';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, MaterialModule],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.css',
})
export class CitiesComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'name', 'longitude', 'latitude'];
  public cities!: MatTableDataSource<City>;

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = 'name';
  public defaultSortOrder: 'asc' | 'desc' = 'asc';

  defaultFilterColumn: string = 'name';
  filterQuery?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  onFilterTextChanged(filterText: string) {
    if (!this.filterTextChanged.observed) {
      this.filterTextChanged
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe((query) => this.loadData(query));
    }
    this.filterTextChanged.next(filterText);
  }

  loadData(query?: string): void {
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.filterQuery = query;
    this.getData(pageEvent);
  }

  getData(event: PageEvent): void {
    var url = environment.baseUrl + '/Cities';
    var params = new HttpParams()
      .set('pageIndex', event.pageIndex.toString())
      .set('pageSize', event.pageSize.toString())
      .set('sortColumn', this.sort ? this.sort.active : this.defaultSortColumn)
      .set(
        'sortOrder',
        this.sort ? this.sort.direction : this.defaultSortOrder
      );
    if (this.filterQuery) {
      params = params
        .set('filterColumn', this.defaultFilterColumn)
        .set('filterQuery', this.filterQuery);
    }
    this.http.get<any>(url, { params }).subscribe({
      next: (result: ApiResponse) => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.cities = new MatTableDataSource<City>(result.data as City[]);
      },
      error: console.log,
    });
  }
}
