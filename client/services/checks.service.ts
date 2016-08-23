import { Control } from '@angular/common';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
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

      var checks = this.checksSub.getValue();
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

  deleteCheck(check) {

    let obs = this.http.delete('/api/checks/' + check.id).cache().map(this.returnData(check));
    obs.subscribe(check => {

      let checks: Object[] = this.checksSub.getValue();
      checks.splice(checks.indexOf(check), 1);

      this.checksSub.next(checks);
    });

    return obs;
  }

  validateTitleAvailable(control: Control): {[key: string]: any} {

    let query = new URLSearchParams();
    query.set('title', control.value);

    return this.http.get('/api/checks', {
      search: query
    }).map(this.extractData).map(checks => {
      if (!checks.length) {
        return;
      }

      return {
        titleAvailable: true
      };
    });
  }

  private extractData(res) {
    return res.json();
  }

  private returnData(data) {
    return function() {
      return data;
    };
  }
}
