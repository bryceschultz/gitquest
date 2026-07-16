import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WelcomeScreen from '../src/components/WelcomeScreen';

describe('WelcomeScreen', () => {
  test('renders title and subtitle', () => {
    render(<WelcomeScreen onSelect={() => { }} />);

    expect(screen.getByText('Git')).toBeInTheDocument();
    expect(screen.getByText('Quest')).toBeInTheDocument();
    expect(
      screen.getByText('Learn git with hacker themed interactive lessons & quizzes')
    ).toBeInTheDocument();
  });

  test('renders both mode options', () => {
    render(<WelcomeScreen onSelect={() => { }} />);

    expect(screen.getByText('New recruit')).toBeInTheDocument();
    expect(screen.getByText('Field agent')).toBeInTheDocument();
  });

  test('calls onSelect with "new" when New recruit is clicked', () => {
    const onSelect = jest.fn();
    render(<WelcomeScreen onSelect={onSelect} />);

    fireEvent.click(screen.getByText('New recruit').closest('button'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('new');
  });

  test('calls onSelect with "vet" when Field agent is clicked', () => {
    const onSelect = jest.fn();
    render(<WelcomeScreen onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Field agent').closest('button'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('vet');
  });
});