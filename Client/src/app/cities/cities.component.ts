import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../environments/environment.development';
import { MaterialModule } from '../material/material.module';
import { City } from './city';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MaterialModule],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.css',
})
export class CitiesComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'name', 'longitude', 'latitude'];
  public cities!: MatTableDataSource<City>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<City[]>(environment.baseUrl + '/Cities').subscribe({
      next: (result) => {
        this.cities = new MatTableDataSource<City>(result);
        this.cities.paginator = this.paginator;
      },
      error: (error) => console.log(error),
    });
  }
}
