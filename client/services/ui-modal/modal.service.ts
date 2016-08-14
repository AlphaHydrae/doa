import { ApplicationRef, ComponentRef, DynamicComponentLoader, Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AppComponent } from '../../app.component';
import { UiModalComponent } from './modal.component';

@Injectable()
export class UiModalService {

  private appComponentRef: ComponentRef<AppComponent>;
  private modalSub: BehaviorSubject<any> = new BehaviorSubject(null);
  public modalObs: Observable<any> = this.modalSub.asObservable();

  public constructor(private appRef: ApplicationRef, private dcl: DynamicComponentLoader, private injector: Injector) {
    appRef.registerBootstrapListener(appComponentRef => {
      this.appComponentRef = appComponentRef;
    });
  }

  open(component) {
    this.modalSub.next(component);
    /*this.dcl.loadNextToLocation(UiModalComponent, this.appComponentRef.instance.viewContainerRef).then(modalComponentRef => {
      modalComponentRef.instance.show();
    });*/
  }
}
