import { TestBed } from '@angular/core/testing';

import { TableStorageService } from './table-storage.service';

describe('TableStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TableStorageService = TestBed.get(TableStorageService);
    expect(service).toBeTruthy();
  });
});
