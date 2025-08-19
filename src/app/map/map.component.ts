import { Component, Inject, OnInit, Output, output, PLATFORM_ID, EventEmitter, ChangeDetectorRef, Input, SimpleChanges, OnChanges } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import { Loader } from '@googlemaps/js-api-loader';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatListModule,MatTabsModule,MatButtonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnChanges {
  @Output() output:EventEmitter<any> = new EventEmitter()
  private _address: string = '';
  @Input() set address(value: string) {
    this._address = value;
  }
  get address(): string {
    return this._address;
  }
  markers: google.maps.Marker[] = [];
  infoWindow!: google.maps.InfoWindow;
  map: google.maps.Map | undefined
  loader = new Loader({
    apiKey: environment.apiKey,
    version: "weekly",
    libraries: ["places"]
  })
  key = environment.openrouterApiKey

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cdr:ChangeDetectorRef) { }

  ngOnInit(): void {
  
  }
  submitPrompt(prompt: string) {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + this.key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
          {
            "role": "user",
            "content": `Give me 2 places of interest and 2 highly-rated restaurants near ${prompt}.Respond only in JSON format` 
          }
        ],
        'provider': {
          'order': [
            'Chutes',
            'Targon'
          ],
          //'allow_fallbacks': false
        }
      })
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const aiReply = extractJsonFromResponse(data?.choices?.[0]?.message?.content);
      if(aiReply)
        console.log('AI Response:', JSON.parse(aiReply));
    })
    .catch(err => {
      console.error('Fetch error:', err);
    });
  }
  ngOnChanges(changes:SimpleChanges): void {
    if (isPlatformBrowser(this.platformId) && changes['address']) {
      this.initMap()
      this.submitPrompt(this._address)
    }
  }
  initMap(){
    if (this._address) {
      this.loader.load().then(() => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: this._address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            console.log(`Latitude: ${location.lat()}, Longitude: ${location.lng()}`);
            this.map?.setCenter(location);
            const circle = new google.maps.Circle({
            center: location,
            map: this.map,
            radius: 500, // Radius in meters
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            });
            this.map?.fitBounds(circle.getBounds() as google.maps.LatLngBounds);
          } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          }
        });
      });
    }
    this.loader
    .importLibrary('maps')
    .then(({Map}) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this._address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          console.log(`Latitude: ${location.lat()}, Longitude: ${location.lng()}`);
          this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: location,
            zoom: 15,
          })
          const requests = [
            { location: location, radius: 500, keyword: 'point of interest' },
            { location: location, radius: 500, keyword: 'restaurant' },
          ];
          
          const service = new google.maps.places.PlacesService(this.map);
          let combinedResults: any[] = [];
          
          requests.forEach((request, index) => {
            service.nearbySearch(request, (results: any, status: any) => {
              console.log(request, index, results);
              
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                combinedResults = combinedResults.concat(results);
                combinedResults.forEach((result) => {
                  const marker = new google.maps.Marker({
                    position: result.geometry.location,
                    map: this.map,
                    title: result.name,
                  });
      
                  const infoWindow = new google.maps.InfoWindow({
                    content: `<div><strong>${result.name}</strong><br>${result.vicinity}</div>`,
                  });
      
                  marker.addListener('click', () => {
                    if (this.infoWindow) {
                    this.infoWindow.close();
                    }
                    infoWindow.open(this.map, marker);
                    this.infoWindow = infoWindow;
                  });
      
                  this.markers.push(marker);
                  });
              }
              
              if (index === requests.length - 1) {
                let addresses = combinedResults.map((r: any) => r.vicinity);
                console.log(combinedResults);
                
                this.output.next(
                  combinedResults.map((r: any) => ({ name: r.name, address: r.vicinity }))
                );
              }
            });
          });
            
          this.map?.setCenter(location);
          const marker = new google.maps.Marker({
            position: location,
            map: this.map,
          });
          this.markers.push(marker);
          this.cdr.markForCheck()
        } else {
      console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
      
    })
    .catch((e) => {
      // do something
    });

  }
  searchNearby(){
    
  }
  populateMarkers(addresses:string[]){


    if(addresses.length){ 
      let coordinates:Map<string,any> = new Map()   
      let duplicated = 0    
      this.loader.load().then(() => {
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
function extractJsonFromResponse(text: string): string | null {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : null;
}
