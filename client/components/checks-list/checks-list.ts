import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ChecksService } from '../../services/checks.service';
import { ChecksListItemComponent } from '../checks-list-item/checks-list-item';

@Component({
  moduleId: module.id.toString(),
  selector: 'checks-list',
  templateUrl: 'checks-list.html',
  providers: [ ChecksListItemComponent ],
  directives: [ ChecksListItemComponent ]
})
export class ChecksListComponent {

  public checks: Observable<Object[]>;

  public constructor(private checksService: ChecksService) {
    this.checks = this.checksService.checksObs;
  }
}
