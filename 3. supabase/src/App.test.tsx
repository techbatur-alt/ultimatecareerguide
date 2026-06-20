import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    role: '',
    loading: false,
    isAtLeast: () => false,
    isRole: () => false,
    profile: null,
    refreshProfile: async () => {},
  }),
}));

describe('App routing', () => {
  it('renders the public homepage route', () => {
    render(<App />);

    expect(screen.getAllByText(/Ultimate Career Guide/i).length).toBeGreaterThan(0);
  });
});
