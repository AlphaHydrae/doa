import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';
import { MODAL_DIRECTIVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap/ng2-bootstrap';

import { UiModalService } from './modal.service';

@Component({
  selector: 'modal',
  templateUrl: 'services/ui-modal/modal.template.html',
  directives: [ MODAL_DIRECTIVES ],
  viewProviders: [ BS_VIEW_PROVIDERS ]
})
export class UiModalComponent {

  @ViewChild('childModal') public modalDirective: ModalDirective;

  public constructor(private uiModalService: UiModalService, public viewContainerRef: ViewContainerRef) {
    this.uiModalService.modalObs.subscribe(component => {
      if (component) {
        this.show();
      }
    });
  }

  show() {
    this.modalDirective.show();
  }
}
