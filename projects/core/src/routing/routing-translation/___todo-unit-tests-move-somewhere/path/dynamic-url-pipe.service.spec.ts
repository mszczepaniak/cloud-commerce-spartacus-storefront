import { TestBed } from '@angular/core/testing';
import { DynamicUrlPipeService } from './dynamic-url-pipe.service';
import { PathPipeService } from './path-pipe.service';
import { RouteRecognizerService } from './dynamic-url-recognizer.service';

const mockPathService = {
  transform: () => {}
};

const mockDynamicUrlRecognizerService = {
  recognize: () => {}
};

describe('DynamicUrlPipeService', () => {
  let pathService: PathPipeService;
  let service: DynamicUrlPipeService;
  let dynamicUrlRecognizer: RouteRecognizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DynamicUrlPipeService,
        {
          provide: PathPipeService,
          useValue: mockPathService
        },
        {
          provide: RouteRecognizerService,
          useValue: mockDynamicUrlRecognizerService
        }
      ]
    });

    pathService = TestBed.get(PathPipeService);
    dynamicUrlRecognizer = TestBed.get(RouteRecognizerService);
    service = TestBed.get(DynamicUrlPipeService);
  });

  describe('transform', () => {
    it('should return result from PathPipeService', () => {
      const inputUrl = 'test-path/value1/value2';
      const expectedResult = ['expected-result'];
      spyOn(pathService, 'transform').and.returnValue(expectedResult);
      spyOn(dynamicUrlRecognizer, 'recognize').and.returnValue({
        nestedRoutesNames: 'testRouteName',
        nestedRoutesParams: { param1: 'value1', param2: 'value2' }
      });

      const result = service.transform(inputUrl);

      expect(pathService.transform).toHaveBeenCalledWith('testRouteName', {
        param1: 'value1',
        param2: 'value2'
      });
      expect(result).toBe(expectedResult);
    });

    it('should get matching route name and params from RouteRecognizerService', () => {
      const inputUrl = 'test-path/value1/value2';
      spyOn(dynamicUrlRecognizer, 'recognize').and.returnValue({
        nestedRoutesNames: null,
        nestedRoutesParams: null
      });
      service.transform(inputUrl);
      expect(dynamicUrlRecognizer.recognize).toHaveBeenCalledWith(inputUrl);
    });

    it('should return original url there is no matching route for this url', () => {
      const inputUrl = 'unknown-path';
      spyOn(dynamicUrlRecognizer, 'recognize').and.returnValue({
        nestedRoutesNames: null,
        nestedRoutesParams: null
      });
      expect(service.transform(inputUrl)).toEqual(inputUrl);
    });
  });
});
