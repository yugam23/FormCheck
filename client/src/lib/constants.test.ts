import { describe, it, expect } from 'vitest';
import * as constants from './constants';

describe('Constants', () => {
  it('should have correct video configuration', () => {
    expect(constants.VIDEO_WIDTH).toBe(640);
    expect(constants.VIDEO_HEIGHT).toBe(480);
    expect(constants.FRAME_RATE).toBe(15);
  });

  it('should have API configuration defaults', () => {
    // These might be undefined or defaults depending on env
    expect(constants.API_URL).toBeDefined();
    expect(constants.WS_URL).toBeDefined();
  });
});
