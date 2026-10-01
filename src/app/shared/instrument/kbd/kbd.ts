import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ohno-kbd',
  templateUrl: './kbd.html',
  styleUrl: './kbd.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKbd {}
