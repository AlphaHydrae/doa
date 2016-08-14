import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChecksService {

  private checksSub: BehaviorSubject<Object[]> = new BehaviorSubject([]);
  public checksObs: Observable<Object[]> = this.checksSub.asObservable();

  constructor(private http: Http) {
    this.refreshChecks();
  }

  createCheck(data) {
  }

  refreshChecks() {

    let obs = this.http.get('/api/checks').cache().map(this.extractData);
    obs.subscribe(checks => {
      this.checksSub.next(this.checksSub.getValue().concat(checks));
    });

    return obs;
  }

  private extractData(res) {
    let body = res.json();
    return body || [];
  }
}
