import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Injectable()
export class ApiService {

  public authToken: string;

  constructor(private _http: Http, private slimLoader: SlimLoadingBarService) {
  }

  http(options: any) {

    let method: string = options.method || 'GET';
    let url = options.url ? options.url : '/api' + options.path;
    let args = [ url ];

    let headers = new Headers();
    if (options.data) {
      headers.set('Content-Type', 'application/json');
      args.push(JSON.stringify(options.data));
    }

    if (this.authToken) {
      headers.set('Authorization', 'Bearer ' + this.authToken);
    }

    let query = new URLSearchParams();
    if (options.query) {
      _.each(options.query, function(value, key) {
        query.set(key, value);
      });
    }

    args.push(new RequestOptions({
      headers: headers,
      search: query
    }));

    this.slimLoader.height = '4px';
    this.slimLoader.start();
    return this._http[method.toLowerCase()].apply(this._http, args).finally(() => {
      this.slimLoader.complete();
    });
  }

  extractData(res) {
    return res.json();
  }
}
