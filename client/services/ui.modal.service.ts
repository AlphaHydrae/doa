import { DynamicComponentLoader, Injectable, Injector } from '@angular/core';

@Injectable()
export class UiModalService {

  public constructor(private dcl: DynamicComponentLoader, private injector: Injector) {
  }

  open(component) {
    this.dcl.loadAsRoot(component, "#modal", this.injector)
  }
}
