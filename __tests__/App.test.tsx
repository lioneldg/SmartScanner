/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Test simple pour vérifier que React Testing Library fonctionne
test('React Testing Library works correctly', () => {
  const TestComponent = () => React.createElement('Text', null, 'Hello World');
  const { getByText } = render(React.createElement(TestComponent));

  expect(getByText('Hello World')).toBeTruthy();
});
