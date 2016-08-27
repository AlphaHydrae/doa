import { Component } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { LoginDialogComponent } from '../login-dialog/component';

@Component({
  selector: 'navbar',
  templateUrl: 'components/navbar/template.html',
  providers: [ LoginDialogComponent ],
  directives: [ LoginDialogComponent ]
})
export class NavbarComponent {

  public title = 'DOA'

  public constructor(private auth: AuthService) {
  }
}
