import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { LocationListComponent } from '../location-list/location-list.component';
import { MapComponent } from '../map/map.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface Location {
  name:string;
  address:string;
  lng:string;
  lat:string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LocationListComponent,MapComponent, MatButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  list:any[] = []
  constructor(private cdr:ChangeDetectorRef){}
  @Input() str:any
  setList(list:any[]){
    this.list = list
    console.log(this.list);
    this.cdr.markForCheck()
  }
}
