import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-side-bar-component',
  imports: [MatSidenavModule, MatExpansionModule, MatDividerModule],
  templateUrl: './side-bar-component.html',
  styleUrl: './side-bar-component.css',
})
export class SideBarComponent {

}
