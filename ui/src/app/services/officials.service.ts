import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Official {
  id: number;
  name: string;
  title: string;
  party: string;
  chamber: string | null;
  district: string | null;
  imageUrl: string | null;
  branch: string;
  state: string;
  source: string;
}

export interface ScrapeResult {
  status: string;
  recordCount: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class OfficialsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAll(): Observable<Official[]> {
    return this.http.get<Official[]>(`${this.baseUrl}/officials`);
  }

  getByBranch(branch: string): Observable<Official[]> {
    return this.http.get<Official[]>(`${this.baseUrl}/officials/branch/${branch}`);
  }

  getByChamber(chamber: string): Observable<Official[]> {
    return this.http.get<Official[]>(`${this.baseUrl}/officials/chamber/${chamber}`);
  }

  search(query: string): Observable<Official[]> {
    return this.http.get<Official[]>(`${this.baseUrl}/officials/search`, { params: { q: query } });
  }

  triggerScrape(): Observable<ScrapeResult> {
    return this.http.post<ScrapeResult>(`${this.baseUrl}/scraper/trigger`, {});
  }
}
