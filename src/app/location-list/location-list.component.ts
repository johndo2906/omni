import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Location } from '../home/home.component';



@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [MatListModule, CommonModule],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss'
})
export class LocationListComponent implements OnInit{
  location_list:Location[] = []
  @Input() set setList(list:any[]){
    this.location_list = list
    console.log(list);
    
  }
  constructor(){

  }

  ngOnInit(): void {
    console.log(this.location_list);
    
  }
}
