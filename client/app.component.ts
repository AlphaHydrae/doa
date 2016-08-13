import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ChecksService } from './services/checks.service';

import './rxjs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.template.html',
  providers: [ ChecksService ]
})
export class AppComponent {
  title = 'DOA'

  public constructor(private checksService: ChecksService, private titleService: Title) {
    titleService.setTitle(this.title);
  }
}
