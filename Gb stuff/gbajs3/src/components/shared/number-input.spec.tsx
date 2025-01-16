import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from './number-input.tsx';

import type { RefObject } from 'react';

describe('<NumberInput />', () => {
  it('renders correctly with default props', () => {
    render(<NumberInput />);

    const inputElement = screen.getByRole('spinbutton');

    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeEnabled();
  });

  it('increments value when increment button is clicked', async () => {
    render(<NumberInput defaultValue="5" step={2} />);

    const inputElement = screen.getByRole('spinbutton');
    const incrementButton = screen.getByLabelText('Increment');

    await userEvent.click(incrementButton);

    expect(inputElement).toHaveValue(7);
  });

  it('decrements value when decrement button is clicked', async () => {
    render(<NumberInput defaultValue="5" step={2} />);

    const inputElement = screen.getByRole('spinbutton');
    const decrementButton = screen.getByLabelText('Decrement');

    await userEvent.click(decrementButton);

    expect(inputElement).toHaveValue(3);
  });

  it('clamps value to min when below range', async () => {
    render(<NumberInput defaultValue="5" min={4} />);

    const inputElement = screen.getByRole('spinbutton');
    const decrementButton = screen.getByLabelText('Decrement');

    await userEvent.click(decrementButton);
    await userEvent.click(decrementButton);

    expect(inputElement).toHaveValue(4);
  });

  it('clamps value to max when above range', async () => {
    render(<NumberInput defaultValue="5" max={6} />);

    const inputElement = screen.getByRole('spinbutton');
    const incrementButton = screen.getByLabelText('Increment');

    await userEvent.click(incrementButton);
    await userEvent.click(incrementButton);

    expect(inputElement).toHaveValue(6);
  });

  it('clamps value to min when empty on blur', async () => {
    render(<NumberInput defaultValue="5" min={1} />);

    const inputElement = screen.getByRole('spinbutton');

    await userEvent.type(inputElement, '{backspace}');
    fireEvent.blur(inputElement);

    expect(inputElement).toHaveValue(1);
  });

  it('clamps value to 0 when empty with no min on blur', async () => {
    render(<NumberInput defaultValue="5" />);

    const inputElement = screen.getByRole('spinbutton');

    await userEvent.type(inputElement, '{backspace}');
    fireEvent.blur(inputElement);

    expect(inputElement).toHaveValue(0);
  });

  it('prevents typing negative sign if min is greater than or equal to 0', async () => {
    render(<NumberInput defaultValue="5" min={0} />);

    const inputElement = screen.getByRole('spinbutton');

    await userEvent.type(inputElement, '{backspace}');
    await userEvent.type(inputElement, '-1');

    expect(inputElement).toHaveValue(1);
  });

  it('allows typing negative sign if min is less than 0', async () => {
    render(<NumberInput defaultValue="5" min={-5} />);

    const inputElement = screen.getByRole('spinbutton');

    await userEvent.type(inputElement, '{backspace}');
    await userEvent.type(inputElement, '-1');

    expect(inputElement).toHaveValue(-1);
  });

  it('respects disabled prop', () => {
    render(<NumberInput disabled />);

    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByLabelText('Increment')).toBeDisabled();
    expect(screen.getByLabelText('Decrement')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = { current: null } as RefObject<HTMLInputElement>;

    render(<NumberInput ref={ref} />);

    const inputElement = screen.getByRole('spinbutton');

    expect(ref.current).toBe(inputElement);
    expect(ref.current).toBeInTheDocument();
  });

  it('accepts callback ref', () => {
    const refSpy = vi.fn();

    render(<NumberInput ref={refSpy} />);

    const inputElement = screen.getByRole('spinbutton');

    expect(refSpy).toHaveBeenCalledOnce();
    expect(refSpy).toHaveBeenCalledWith(inputElement);
  });
});
