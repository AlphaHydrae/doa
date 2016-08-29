import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class SettingsService {

  constructor(private auth: AuthService) {
  }

  canUpdate() {
    return this.auth.hasRole('admin');
  }
}
