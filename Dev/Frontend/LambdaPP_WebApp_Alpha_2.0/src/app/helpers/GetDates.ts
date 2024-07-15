import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  static getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  static getUTCDate(myDate: Date)
  {
    return new Date(Date.UTC(myDate.getFullYear(), myDate.getMonth(), myDate.getDate()));
  }
}