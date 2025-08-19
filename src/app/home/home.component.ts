import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { LocationListComponent } from '../location-list/location-list.component';
import { MapComponent } from '../map/map.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  name:string;
  address:string;
  lng:string;
  lat:string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LocationListComponent,MapComponent, MatButtonModule, CommonModule,  MatInputModule, FormsModule, MatToolbarModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class HomeComponent {
  list:any[] = []
  address = ''
  counter = 0
  loader = new Loader({
    apiKey: environment.apiKey,
    version: "weekly",
    libraries: ["places"]
  })

  showMapLayout = false;
  constructor(private cdr:ChangeDetectorRef, private zone: NgZone, private http: HttpClient){

  }
  setList(list:any[]){
    this.zone.run(() => {
      this.list = list
      //this.counter = Math.floor(Math.random() * 100); // Set counter as a random number between 0 and 99
    });
   
    //this.cdr.detectChanges();
  }
  goToMap(value: string) {
    this.address = value.trim();
    if (this.address) {
      this.showMapLayout = true;
    }
  }
  @ViewChild('searchInput') searchInput!: ElementRef;

  ngOnInit() {
    if (typeof window !== "undefined") {
      this.loadGoogleMapsAutocomplete();
    }
  }
  loadGoogleMapsAutocomplete() {
    this.loader.load().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
        types: ['geocode'], // You can also use ['(cities)'] for city-specific results
        componentRestrictions: { country: 'CA' } // Restrict to a country if needed
      });
  
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          //this.address = place.formatted_address || ''
          // console.log('Selected Place:', place.formatted_address);
          // console.log('Latitude:', place.geometry.location?.lat());
          // console.log('Longitude:', place.geometry.location?.lng());
        }
      });
      const endinput = document.getElementById("search-input") as HTMLInputElement;

      const autocomplete2 = new google.maps.places.Autocomplete(endinput, {
        types: ['geocode'], // You can also use ['(cities)'] for city-specific results
        componentRestrictions: { country: 'CA' } // Restrict to a country if needed
      });
  
      autocomplete2.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log();
      });
    })
    
  }
}
