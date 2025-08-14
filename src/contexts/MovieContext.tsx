import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tmdbService } from '../services/tmdbService';
import { MovieData } from '../types';

interface MovieContextType {
  movies: MovieData[];
  trending: MovieData[];
  popular: MovieData[];
  loading: boolean;
  searchMovies: (query: string) => Promise<void>;
  getMovieById: (id: string) => Promise<MovieData | null>;
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
  const [movies, setMovies] = useState<MovieData[]>([]);
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
        setMovies([...trendingData, ...popularData]);
      } catch (error) {
        console.error('Error fetching initial movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setMovies([...trending, ...popular]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await tmdbService.searchMovie(query);
      if (searchResults) {
        setMovies([searchResults]);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovieById = async (id: string): Promise<MovieData | null> => {
    try {
      // For now, we'll search through existing movies
      // In a real app, you'd have a dedicated endpoint for this
      const movie = movies.find(m => m.id.toString() === id);
      if (movie) return movie;
      
      // If not found, try to search for it
      const searchResult = await tmdbService.searchMovie(id);
      return searchResult;
    } catch (error) {
      console.error('Error getting movie by ID:', error);
      return null;
    }
  };

  const value = {
    movies,
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