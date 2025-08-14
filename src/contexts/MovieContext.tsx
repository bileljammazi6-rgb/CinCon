import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tmdbService } from '../services/tmdbService';
import { MovieData } from '../types';

interface MovieContextType {
  trending: MovieData[];
  popular: MovieData[];
  loading: boolean;
  searchMovies: (query: string) => Promise<MovieData[]>;
  getMovieById: (id: number) => MovieData | null;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function useMovies() {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}

interface MovieProviderProps {
  children: ReactNode;
}

export function MovieProvider({ children }: MovieProviderProps) {
  const [trending, setTrending] = useState<MovieData[]>([]);
  const [popular, setPopular] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [trendingData, popularData] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getPopularMovies()
        ]);
        
        setTrending(trendingData);
        setPopular(popularData);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        // Set fallback data
        setTrending([]);
        setPopular([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const searchMovies = async (query: string): Promise<MovieData[]> => {
    try {
      return await tmdbService.searchMovies(query);
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  };

  const getMovieById = (id: number): MovieData | null => {
    const allMovies = [...trending, ...popular];
    return allMovies.find(movie => movie.id === id) || null;
  };

  const value = {
    trending,
    popular,
    loading,
    searchMovies,
    getMovieById,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
}