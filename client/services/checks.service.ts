import { Control } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from './api.service';

@Injectable()
export class ChecksService {

  private checksSub: BehaviorSubject<Object[]> = new BehaviorSubject([]);
  public checksObs: Observable<Object[]> = this.checksSub.asObservable();

  constructor(private api: ApiService) {
    this.refreshChecks();
  }

  createCheck(data) {

    let obs = this.api.http({
      method: 'POST',
      path: '/checks',
      data: data
    }).cache().map(this.extractData);

    obs.subscribe(check => {

      var checks = this.checksSub.getValue();
      checks.push(check);

      this.checksSub.next(checks);
    });

    return obs;
  }

  refreshChecks() {

    let obs = this.api.http({
      path: '/checks'
    }).cache().map(this.extractData);

    obs.subscribe(checks => {
      this.checksSub.next(this.checksSub.getValue().concat(checks));
    });

    return obs;
  }

  deleteCheck(check) {

    let obs = this.api.http({
      method: 'DELETE',
      path: '/checks/' + check.id
    }).cache().map(this.returnData(check));

    obs.subscribe(check => {

      let checks: Object[] = this.checksSub.getValue();
      checks.splice(checks.indexOf(check), 1);

      this.checksSub.next(checks);
    });

    return obs;
  }

  validateTitleAvailable(control: Control): {[key: string]: any} {
    return this.api.http({
      url: '/api/checks',
      query: {
        title: control.value
      }
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
