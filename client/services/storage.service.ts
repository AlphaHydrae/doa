import * as _ from 'lodash';
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  private localStorage: any;

  constructor() {
    this.localStorage = localStorage || {};
  }

  set(key: string, value: any) {
    if (value !== undefined) {
      this.localStorage[key] = JSON.stringify(value);
      return value;
    } else {
      return this.remove(key);
    }
  }

  get(key: string) {
    return _.has(this.localStorage, key) ? JSON.parse(this.localStorage[key]) : undefined;
  }

  remove(key: string) {
    var value = this.get(key);
    delete this.localStorage[key];
    return value;
  }
}
