import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nwb-progression',
  templateUrl: './progression.component.html',
  styleUrls: ['./progression.component.scss'],
  host: {
    class: 'layout-row gap-4',
  },
})
export class ProgressionComponent implements OnInit {

  public constructor() {

  }

  public ngOnInit(): void {
  }

}
