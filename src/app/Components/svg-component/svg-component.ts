import { AfterViewInit, Component, ElementRef, QueryList, Renderer2, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-svg-component',
  imports: [],
  templateUrl: './svg-component.html',
  styleUrl: './svg-component.css',
})
export class SvgComponent implements AfterViewInit {
  // Prende tutti gli elementi che hanno una variabile locale (es. #path1, #path2)
  // Oppure usa un selettore CSS come 'path'
  @ViewChildren('path1, path2, path3, path4, path5, path6') paths!: QueryList<ElementRef<SVGPathElement>>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.animatePaths();
  }

  animatePaths() {
    let delay = 0;

    this.paths.forEach((pathRef) => {
      const path = pathRef.nativeElement;
      const length = path.getTotalLength(); // Calcola la lunghezza REALE di questo specifico path

      // Configura lo stato iniziale (nascosto)
      this.renderer.setStyle(path, 'stroke-dasharray', length);
      this.renderer.setStyle(path, 'stroke-dashoffset', length);
      
      // Applica l'animazione con un ritardo progressivo
      // In questo modo i path si scrivono uno dopo l'altro
      setTimeout(() => {
        this.renderer.setStyle(path, 'transition', 'stroke-dashoffset 0.5s linear');
        this.renderer.setStyle(path, 'stroke-dashoffset', '0');
      }, delay);

      // Aumenta il ritardo per il prossimo pezzo (es. 2 secondi dopo)
      delay += 500; 
    });
  }
}