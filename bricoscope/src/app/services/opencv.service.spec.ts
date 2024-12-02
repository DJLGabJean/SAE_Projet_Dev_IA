import { TestBed } from '@angular/core/testing';

import { OpenCVService } from './opencv.service';

describe('OpenCVService', () => {
  let service: OpenCVService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenCVService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
