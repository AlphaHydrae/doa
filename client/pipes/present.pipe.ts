import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'present'
})
export class PresentPipe implements PipeTransform {
  transform(value: any): boolean {
    return value && (value.length === undefined || !!value.length);
  }
}
