import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Official, OfficialsService } from '../../services/officials.service';

@Component({
  selector: 'app-officials-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './officials-list.html',
  styleUrl: './officials-list.scss',
})
export class OfficialsListComponent implements OnInit {
  private officialsService = inject(OfficialsService);

  officials = signal<Official[]>([]);
  searchQuery = signal('');
  loading = signal(true);
  activeTab = signal<'executive' | 'senate' | 'house'>('executive');

  ngOnInit() {
    this.loadOfficials();
  }

  loadOfficials() {
    this.loading.set(true);
    const tab = this.activeTab();

    if (tab === 'executive') {
      this.officialsService.getByBranch('executive').subscribe({
        next: (data) => { this.officials.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.officialsService.getByChamber(tab).subscribe({
        next: (data) => { this.officials.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  switchTab(tab: 'executive' | 'senate' | 'house') {
    this.activeTab.set(tab);
    this.loadOfficials();
  }

  onSearch() {
    const q = this.searchQuery();
    if (q.length > 1) {
      this.loading.set(true);
      this.officialsService.search(q).subscribe({
        next: (data) => { this.officials.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else if (q.length === 0) {
      this.loadOfficials();
    }
  }

  getPartyClass(party: string): string {
    if (party.includes('Democrat')) return 'party-dem';
    if (party.includes('Republican')) return 'party-rep';
    return 'party-other';
  }
}
