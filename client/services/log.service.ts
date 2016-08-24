import { Injectable } from '@angular/core'

@Injectable()
export class Logger {

  constructor() {
  }

  get debug() {
    return console.debug.bind(console);
  }

  get info() {
    return console.log.bind(console);
  }

  get warn() {
    return console.warn.bind(console);
  }

  get error() {
    return console.error.bind(console);
  }
}
