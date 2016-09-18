import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

import { ChecksService } from '../../services/checks.service';

@Component({
  moduleId: module.id.toString(),
  selector: '[check-list-item]',
  templateUrl: 'checks-list-item.html',
  host: {
    '[class.list-group-item-info]': 'infoClass',
    '[class.list-group-item-danger]': 'dangerClass',
    '[class.list-group-item-success]': 'successClass',
    '[class.list-group-item-warning]': 'warningClass'
  }
})
export class ChecksListItemComponent implements OnInit {

  @Input()
  public check: any;

  private infoClass: Boolean = false;
  private dangerClass: Boolean = false;
  private successClass: Boolean = false;
  private warningClass: Boolean = false;

  public constructor(private checksService: ChecksService) {
  }

  ngOnInit() {

    var now = moment(),
        checkedAt = this.check.checkedAt ? moment(this.check.checkedAt) : null;

    if (!checkedAt) {
      this.infoClass = true;
    } else if (now.isAfter(checkedAt.clone().add(this.check.interval * 2, 'minutes'))) {
      this.dangerClass = true;
    } else if (now.isAfter(checkedAt.clone().add(this.check.interval, 'minutes'))) {
      this.warningClass = true;
    } else {
      this.successClass = true;
    }
  }

  public delete(check) {
    this.checksService.deleteCheck(check);
  }
}
