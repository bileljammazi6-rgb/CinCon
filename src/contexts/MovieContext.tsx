import React, { createContext, useContext, useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdbService';
import { MovieData } from '../types';

interface MovieContextType {
  movies: MovieData[];
  loading: boolean;
  error: string | null;
  getPopularMovies: () => Promise<MovieData[]>;
  getTrendingMovies: () => Promise<MovieData[]>;
  getTopRatedMovies: () => Promise<MovieData[]>;
  getUpcomingMovies: () => Promise<MovieData[]>;
  searchMovies: (query: string) => Promise<MovieData[]>;
  searchTVShows: (query: string) => Promise<MovieData[]>;
  getPopularTVShows: () => Promise<MovieData[]>;
  getTopRatedTVShows: () => Promise<MovieData[]>;
  getOnTheAirTVShows: () => Promise<MovieData[]>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(`Failed to ${operation}. Please try again.`);
    // Return empty array instead of throwing
    return [];
  };

  const getPopularMovies = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getPopularMovies();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch popular movies');
    } finally {
      setLoading(false);
    }
  };

  const getTrendingMovies = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getTrendingMovies();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch trending movies');
    } finally {
      setLoading(false);
    }
  };

  const getTopRatedMovies = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getTopRatedMovies();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch top rated movies');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingMovies = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getUpcomingMovies();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch upcoming movies');
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query: string): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.searchMovies(query);
      return data || [];
    } catch (error) {
      return handleError(error, 'search movies');
    } finally {
      setLoading(false);
    }
  };

  const searchTVShows = async (query: string): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.searchTVShows(query);
      return data || [];
    } catch (error) {
      return handleError(error, 'search TV shows');
    } finally {
      setLoading(false);
    }
  };

  const getPopularTVShows = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getPopularTVShows();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch popular TV shows');
    } finally {
      setLoading(false);
    }
  };

  const getTopRatedTVShows = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getTopRatedTVShows();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch top rated TV shows');
    } finally {
      setLoading(false);
    }
  };

  const getOnTheAirTVShows = async (): Promise<MovieData[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tmdbService.getOnTheAirTVShows();
      return data || [];
    } catch (error) {
      return handleError(error, 'fetch on the air TV shows');
    } finally {
      setLoading(false);
    }
  };

  const value: MovieContextType = {
    movies,
    loading,
    error,
    getPopularMovies,
    getTrendingMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
    searchTVShows,
    getPopularTVShows,
    getTopRatedTVShows,
    getOnTheAirTVShows,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};