import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Logger } from './log.service';
import { StorageService } from './storage.service';

@Injectable()
export class AuthService {

  private data: any;

  constructor(private api: ApiService, private log: Logger, private storage: StorageService) {
  }

  init() {
    this.loadAuthData();
  }

  signIn(data) {

    let obs = this.api.http({
      method: 'POST',
      path: '/auth',
      data: data
    }).cache().map(this.extractData);

    obs.subscribe(authData => {
      this.data = authData;
      this.saveAuthData();
      this.log.debug('User ' + authData.user.email + ' logged in');
    });

    return obs;
  }

  signOut() {
    if (_.isNil(this.data)) {
      return;
    }

    var email = this.data.user.email;
    this.data = undefined;
    this.log.debug('User ' + email + ' logged out');
  }

  isSignedIn() {
    return !_.isNil(this.data);
  }

  private loadAuthData() {
    this.data = this.storage.get('auth');
    this.forwardAuthData();
  }

  private saveAuthData() {
    this.storage.set('auth', this.data);
    this.forwardAuthData();
  }

  private forwardAuthData() {
    if (this.data) {
      this.api.authToken = this.data.token;
    } else {
      this.api.authToken = null;
    }
  }

  private extractData(res) {
    return res.json();
  }
}
