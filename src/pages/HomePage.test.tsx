import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';

// Mock fetchPanoramasFromTicketmaster
jest.mock('../data/mockData', () => ({
  fetchPanoramasFromTicketmaster: jest.fn()
}));

const { fetchPanoramasFromTicketmaster } = require('../data/mockData');

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra panoramas correctamente', async () => {
    fetchPanoramasFromTicketmaster.mockResolvedValue([
      {
        id: '1',
        title: 'Evento Test',
        description: 'Desc',
        category: 'cultura',
        companyType: ['individual'],
        price: 0,
        location: { lat: 0, lng: 0, address: '', city: 'CDMX' },
        weatherDependent: false,
        indoor: false,
        availability: {},
        imageUrl: '',
        rating: 4.5,
        date: '2024-01-01',
        time: '20:00',
        url: 'https://test.com',
      }
    ]);
    render(<HomePage />);
    expect(screen.getByText(/Cargando panoramas/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Evento Test/i)).toBeInTheDocument());
  });

  it('muestra mensaje de error si falla el fetch', async () => {
    fetchPanoramasFromTicketmaster.mockRejectedValue(new Error('fail'));
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText(/Error al cargar panoramas/i)).toBeInTheDocument());
  });

  it('muestra mensaje si no hay panoramas', async () => {
    fetchPanoramasFromTicketmaster.mockResolvedValue([]);
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText(/No se encontraron panoramas/i)).toBeInTheDocument());
  });
});
