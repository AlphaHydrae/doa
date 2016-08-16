import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
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

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let obs = this.http.post('/api/checks', JSON.stringify(data), options).cache().map(this.extractData);
    obs.subscribe(check => {

      var checks = this.checksSub.getValue().slice();
      checks.push(check);

      this.checksSub.next(checks);
    });

    return obs;
  }

  refreshChecks() {

    let obs = this.http.get('/api/checks').cache().map(this.extractData);
    obs.subscribe(checks => {
      this.checksSub.next(this.checksSub.getValue().concat(checks));
    });

    return obs;
  }

  private extractData(res) {
    return res.json();
  }
}
