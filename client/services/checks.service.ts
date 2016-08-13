import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChecksService {

  private _checks: BehaviorSubject<Object[]> = new BehaviorSubject([]);
  public checks: Observable<Object[]> = this._checks.asObservable();

  constructor(private http: Http) {
    this.refreshChecks().subscribe(checks => {
      this._checks.next(this._checks.getValue().concat(checks));
    });
  }

  refreshChecks() {
    return this.http.get('/api/checks').map(this.extractData);
  }

  private extractData(res) {
    let body = res.json();
    return body || [];
  }
}
