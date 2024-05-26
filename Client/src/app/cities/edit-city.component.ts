import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Country } from '../countries/country.model';
import { MaterialModule } from '../material/material.module';
import { City } from './city.model';

@Component({
  selector: 'app-edit-city',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: './edit-city.component.html',
  styleUrl: './edit-city.component.css',
})
export class EditCityComponent implements OnInit {
  title?: string;
  form!: FormGroup;
  city?: City;
  id?: number;
  countries?: Country[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        name: new FormControl('', Validators.required),
        latitude: new FormControl('', Validators.required),
        longitude: new FormControl('', Validators.required),
        countryId: new FormControl('', Validators.required),
      },
      null,
      this.isDupeCity()
    );
    this.loadData();
  }

  loadData() {
    this.loadCountries();
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : 0;
    if (this.id) {
      const url = `${environment.baseUrl}/Cities/${this.id}`;
      this.http.get<City>(url).subscribe({
        next: (result) => {
          this.city = result;
          this.title = `Edit ${this.city.name}`;
          this.form.patchValue(this.city);
        },
        error: console.log,
      });
    } else {
      this.title = 'Add City';
    }
  }

  loadCountries() {
    const url = `${environment.baseUrl}/Countries`;
    const params = new HttpParams()
      .set('pageIndex', '0')
      .set('pageSize', 9999)
      .set('sortColumn', 'name');

    this.http.get<any>(url, { params }).subscribe({
      next: (result) => {
        this.countries = result.data;
      },
      error: console.log,
    });
  }

  onSubmit() {
    // const city = this.id ? this.city : <City>{};
    this.city ??= <City>{};
    this.city.name = this.form.controls['name'].value;
    this.city.latitude = this.form.controls['latitude'].value;
    this.city.longitude = this.form.controls['longitude'].value;
    this.city.countryId = +this.form.controls['countryId'].value;
    if (this.id) {
      const url = `${environment.baseUrl}/Cities/${this.city.id}`;
      this.http.put<City>(url, this.city).subscribe({
        next: (result) => {
          console.log(this.city?.id, 'updated');
          this.router.navigate(['/cities']);
        },
        error: console.log,
      });
    } else {
      const url = `${environment.baseUrl}/Cities`;
      this.http.post<City>(url, this.city).subscribe({
        next: (result) => {
          console.log(this.city?.id, 'updated');
          this.router.navigate(['/cities']);
        },
        error: console.log,
      });
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      // const city = <City>{};
      const city: City = {
        id: this.id ?? 0,
        name: this.form.controls['name'].value,
        latitude: this.form.controls['latitude'].value,
        longitude: this.form.controls['longitude'].value,
        countryId: this.form.controls['countryId'].value,
      };
      const url = `${environment.baseUrl}/Cities/IsDupeCity`;
      return this.http
        .post<boolean>(url, city)
        .pipe(map((result) => (result ? { isDupeCity: result } : null)));
    };
  }
}
