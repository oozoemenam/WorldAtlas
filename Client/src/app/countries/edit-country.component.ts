import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Country } from '../countries/country.model';
import { MaterialModule } from '../material/material.module';

@Component({
  selector: 'app-edit-country',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: './edit-country.component.html',
  styleUrl: './edit-country.component.css',
})
export class EditCountryComponent implements OnInit {
  title?: string;
  form!: FormGroup;
  country?: Country;
  id?: number;
  countries?: Country[];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required, this.isDupeField('name')],
      iso2: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]{2}$/)],
        this.isDupeField('iso2'),
      ],
      iso3: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]{3}$/)],
        this.isDupeField('iso3'),
      ],
    });
    this.loadData();
  }

  loadData() {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : 0;
    if (this.id) {
      const url = `${environment.baseUrl}/Countries/${this.id}`;
      this.http.get<Country>(url).subscribe({
        next: (result) => {
          this.country = result;
          this.title = `Edit ${this.country.name}`;
          this.form.patchValue(this.country);
        },
        error: console.log,
      });
    } else {
      this.title = 'Add Country';
    }
  }

  onSubmit() {
    // const country = this.id ? this.country : <Country>{};
    this.country ??= <Country>{};
    this.country.name = this.form.controls['name'].value;
    this.country.iso2 = this.form.controls['iso2'].value;
    this.country.iso3 = this.form.controls['iso3'].value;
    if (this.id) {
      const url = `${environment.baseUrl}/Countries/${this.country.id}`;
      this.http.put<Country>(url, this.country).subscribe({
        next: (result) => {
          console.log(this.country?.id, 'updated');
          this.router.navigate(['/countries']);
        },
        error: console.log,
      });
    } else {
      const url = `${environment.baseUrl}/Countries`;
      this.http.post<Country>(url, this.country).subscribe({
        next: (result) => {
          console.log(this.country?.id, 'updated');
          this.router.navigate(['/countries']);
        },
        error: console.log,
      });
    }
  }

  isDupeField(fieldName: string): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      const params = new HttpParams()
        .set('countryId', this.id?.toString() ?? '0')
        .set('fieldName', fieldName)
        .set('fieldValue', control.value);
      const url = `${environment.baseUrl}/Countries/IsDupeField`;
      return this.http
        .post<boolean>(url, null, { params })
        .pipe(map((result) => (result ? { isDupeField: result } : null)));
    };
  }

  getErrors(control: AbstractControl, displayName: string): string[] {
    const errors: string[] = [];
    Object.keys(control.errors || {}).forEach((key) => {
      switch (key) {
        case 'required':
          errors.push(`${displayName} is required.`);
          break;
        case 'pattern':
          errors.push(`${displayName} contains invalid characters.`);
          break;
        case 'isDupeField':
          errors.push(`${displayName} already exists. Choose another.`);
          break;
        default:
          errors.push(`${displayName} already exists. Choose another.`);
          break;
      }
    });
    return errors;
  }
}
