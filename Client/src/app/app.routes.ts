import { Routes } from '@angular/router';
import { CitiesComponent } from './cities/cities.component';
import { EditCityComponent } from './cities/edit-city.component';
import { CountriesComponent } from './countries/countries.component';
import { EditCountryComponent } from './countries/edit-country.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', component: CitiesComponent },
  { path: 'city/:id', component: EditCityComponent },
  { path: 'city', component: EditCityComponent },
  { path: 'country/:id', component: EditCountryComponent },
  { path: 'country', component: EditCountryComponent },
  { path: 'countries', component: CountriesComponent },
];
