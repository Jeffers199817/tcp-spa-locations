import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);
  protected readonly title = signal('tcp-spa-locations');

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    // Atajo discreto para administradores: Ctrl + Shift + A o Alt + A
    if ((event.ctrlKey && event.shiftKey && (event.key === 'a' || event.key === 'A')) ||
        (event.altKey && (event.key === 'a' || event.key === 'A'))) {
      event.preventDefault();
      this.router.navigate(['/admin']);
    }
  }
}
