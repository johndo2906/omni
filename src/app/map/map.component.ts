import { Component, Inject, OnInit, Output, output, PLATFORM_ID, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import { Loader } from '@googlemaps/js-api-loader';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatListModule,MatTabsModule,MatButtonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  @Output() output:EventEmitter<any> = new EventEmitter()

  markers: google.maps.Marker[] = [];
  infoWindow!: google.maps.InfoWindow;
  map: google.maps.Map | undefined


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cdr:ChangeDetectorRef) { }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap()
      console.log(this.platformId);
      
    } else {
      // Fallback code for server-side rendering
    }

  }
  initMap(){
    let loader = new Loader({
      apiKey: 'AIzaSyCzO14u0AICidQuIhT1-0KJqhVXikTJJ9s',
      version: "weekly",
      libraries: ["places"]
    })
    
    loader
    .importLibrary('maps')
    .then(({Map}) => {
      console.log(Map);
      
      const location = { lat: 49.2827, lng: -123.1207}
        this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
          center: location,
          zoom: 15,
      })
      var request = {
          location: location,
          radius: 500,
          type: 'restaurant'
        };
        var service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request,(results:any, status:any) =>{
          console.log(typeof results, typeof status);
          
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              console.log(results[i]);
              
            }
            let addresses = results.map((r:any) => r.vicinity)
            this.populateMarkers(addresses)
            this.output.emit(
              results.map((r:any) => ({name:r.name,address: r.vicinity}))
            )
            console.log('test');
            this.cdr.markForCheck()
          }
        })
    })
    .catch((e) => {
      // do something
    });

  }

  populateMarkers(addresses:string[]){


    if(addresses.length){ 
      let coordinates:Map<string,any> = new Map()   
      let duplicated = 0    
      let loader = new Loader({
        apiKey: 'AIzaSyCzO14u0AICidQuIhT1-0KJqhVXikTJJ9s',
        version: "weekly",
        libraries: ["places"]
      })
      loader.load().then(() => {
        let geocoder = new google.maps.Geocoder();

        addresses.forEach(ad => {
          
          
          let clean_address = JSON.parse(JSON.stringify(ad.replace(/,/g, " ")))
          geocoder.geocode( { 'address':clean_address}, (results, status) => {
            if (status == 'OK') {
              let data = results ? results[0].geometry.location : null
              if(data && addresses.indexOf(ad) != -1){
                const location = data
                
                if(!coordinates.get(location.lat().toString()+location.lng())){
                  coordinates.set(location.lat().toString()+location.lng(),location)
                  
                  const marker = new google.maps.Marker({
                    position: location,
                    map: this.map,
                    label:""+(addresses.indexOf(ad)+1)
                  });
                  this.infoWindow = new google.maps.InfoWindow({
                    content: `<div>Placeholder</div>`
                  });
                  this.markers.push(marker)
                  marker.addListener('click', () => {
                    this.map?.panTo(location)
                    if (this.infoWindow) {
                      this.infoWindow.close();
                    }
                    
                  });
                }
                else{
                  
                  
                  duplicated++
                  //console.log(duplicated);
                } 
                
              }
            } else {
              //alert('Geocode was not successful for the following reason: ' + status);
              //console.log(status);
              //throw new Error(status);
              
              
            }
          });
     
            
        })
      })  
      
      
    }
  }
}
