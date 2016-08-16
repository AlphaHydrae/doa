import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empty',
  pure: false
})
export class EmptyPipe implements PipeTransform {
  transform(value: Array<any>): boolean {
    return !value || !value.length;
  }
}
