import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Location } from '../home/home.component';



@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [MatListModule, CommonModule],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss'
})
export class LocationListComponent implements OnInit, OnChanges{
  location_list:Location[] = []
  @Input() set setList(list:{list:any[],counter:number}){
    this.location_list = list.list
    console.log(list);
    
    this.cdr.detectChanges()

  }
  constructor(private cdr:ChangeDetectorRef){

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes){
      console.log(changes);
      
    }
  }

  ngOnInit(): void {    
  }
  selectItem(item:any){
    console.log(item);

  }
}
