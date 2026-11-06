/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({ vs2015: {} }));
jest.mock('vega-embed', () => jest.fn());
// Keep browser audio idle while testing the disconnected console in jsdom.
jest.mock('./lib/utils', () => ({
  ...jest.requireActual('./lib/utils'),
  audioContext: () => new Promise(() => {}),
}));

test('renders the console without connecting on startup', () => {
  const previousKey = process.env.REACT_APP_GEMINI_API_KEY;
  process.env.REACT_APP_GEMINI_API_KEY = 'synthetic-fixture';
  const socket = jest.spyOn(window, 'WebSocket').mockImplementation(() => {
    throw new Error('Unexpected WebSocket connection in the startup test');
  });
  try {
    const App = require('./App').default;
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Console' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'play_arrow' })).toBeInTheDocument();
    expect(socket).not.toHaveBeenCalled();
  } finally {
    socket.mockRestore();
    if (previousKey === undefined) {
      delete process.env.REACT_APP_GEMINI_API_KEY;
    } else {
      process.env.REACT_APP_GEMINI_API_KEY = previousKey;
    }
  }
});
