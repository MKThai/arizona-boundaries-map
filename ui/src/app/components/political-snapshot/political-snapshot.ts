import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficialsService, ScrapeResult } from '../../services/officials.service';

@Component({
  selector: 'app-political-snapshot',
  imports: [CommonModule],
  templateUrl: './political-snapshot.html',
  styleUrl: './political-snapshot.scss',
})
export class PoliticalSnapshotComponent {
  private officialsService = inject(OfficialsService);

  scraping = signal(false);
  scrapeResult = signal<ScrapeResult | null>(null);

  triggerScrape() {
    this.scraping.set(true);
    this.scrapeResult.set(null);
    this.officialsService.triggerScrape().subscribe({
      next: (result) => {
        this.scrapeResult.set(result);
        this.scraping.set(false);
      },
      error: () => this.scraping.set(false),
    });
  }
}
