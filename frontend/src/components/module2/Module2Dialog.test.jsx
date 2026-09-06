import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Module2Dialog from './Module2Dialog';

describe('Module2Dialog', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  test('renders through a portal, locks scrolling, and closes with Escape', () => {
    const onClose = jest.fn();
    const { unmount } = render(
      <Module2Dialog onClose={onClose} labelledBy="dialog-title">
        <h2 id="dialog-title">Production Run</h2>
      </Module2Dialog>
    );

    expect(screen.getByRole('dialog', { name: 'Production Run' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  test('closes from the backdrop but not from inside the panel', () => {
    const onClose = jest.fn();
    render(
      <Module2Dialog onClose={onClose} labelledBy="dialog-title">
        <h2 id="dialog-title">Supplier Catalog</h2>
      </Module2Dialog>
    );

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
