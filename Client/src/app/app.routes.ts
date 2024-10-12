import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { CitiesComponent } from './cities/cities.component';
import { EditCityComponent } from './cities/edit-city.component';
import { CountriesComponent } from './countries/countries.component';
import { EditCountryComponent } from './countries/edit-country.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'cities', component: CitiesComponent },
  { path: 'city/:id', component: EditCityComponent, canActivate: [AuthGuard] },
  { path: 'city', component: EditCityComponent, canActivate: [AuthGuard] },
  {
    path: 'country/:id',
    component: EditCountryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'country',
    component: EditCountryComponent,
    canActivate: [AuthGuard],
  },
  { path: 'countries', component: CountriesComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];
