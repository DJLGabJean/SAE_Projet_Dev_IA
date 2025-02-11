import { TestBed } from '@angular/core/testing';

import { TensorflowjsService } from './tensorflowjs.service';

describe('TensorflowjsService', () => {
  let service: TensorflowjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TensorflowjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
