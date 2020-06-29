import { TestBed } from '@angular/core/testing';

import { GenerateChartDataService } from './generate-chart-data.service';

describe('GenerateChartDataService', () => {
  let service: GenerateChartDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateChartDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
