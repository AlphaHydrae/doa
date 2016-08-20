import {provide, Directive} from '@angular/core';
import {
  NG_ASYNC_VALIDATORS,
  Control,
  Validators,
  Validator
} from '@angular/common';

@Directive({
  selector: '[checkTitleUniqueness][ngModel]',
  providers: [
    provide(NG_ASYNC_VALIDATORS, {
      useExisting: CheckTitleUniquenessValidator,
      multi: true
    })
  ]
})
export class CheckTitleUniquenessValidator implements Validator {
  validate(control: Control): {[key: string]: any} {
    let title: string = control.value;
      console.log('@@@@@@@@@@@@@');
    return new Promise((resolve) => {
      console.log('@@@@@@@@@@@@@');
      /*User.query({by: {email}}).then((users) => {
        let emails = Array.from(users.values()).map((user) => user.email);
        console.log(emails, control);
        resolve(
          emails.includes(email)
            ? {'userAvailability': true}
            : null
        );
      });*/
     resolve(true);
    });
  }
}
