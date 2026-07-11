import { TestBed } from '@angular/core/testing';

import { Recordatorios } from './recordatorios';

describe('Recordatorios', () => {
  let service: Recordatorios;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recordatorios);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
