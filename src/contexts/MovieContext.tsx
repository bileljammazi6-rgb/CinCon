import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tmdbService } from '../services/tmdbService';
import { MovieData } from '../types';

interface MovieContextType {
  movies: MovieData[];
  trending: MovieData[];
  popular: MovieData[];
  loading: boolean;
  searchMovies: (query: string) => Promise<MovieData[]>;
  getMovieById: (id: string) => Promise<MovieData | null>;
  getPopularMovies: () => Promise<MovieData[]>;
  getTrendingMovies: () => Promise<MovieData[]>;
  getTopRatedMovies: () => Promise<MovieData[]>;
  getUpcomingMovies: () => Promise<MovieData[]>;
  searchTVShows: (query: string) => Promise<MovieData[]>;
  getPopularTVShows: () => Promise<MovieData[]>;
  getTopRatedTVShows: () => Promise<MovieData[]>;
  getOnTheAirTVShows: () => Promise<MovieData[]>;
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

  const searchMovies = async (query: string): Promise<MovieData[]> => {
    if (!query.trim()) {
      return [...trending, ...popular];
    }

    try {
      const searchResults = await tmdbService.searchMovie(query);
      if (searchResults) {
        return [searchResults];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
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

  const getPopularMovies = async (): Promise<MovieData[]> => {
    try {
      return await tmdbService.getPopularMovies();
    } catch (error) {
      console.error('Error getting popular movies:', error);
      return [];
    }
  };

  const getTrendingMovies = async (): Promise<MovieData[]> => {
    try {
      return await tmdbService.getTrendingMovies();
    } catch (error) {
      console.error('Error getting trending movies:', error);
      return [];
    }
  };

  const getTopRatedMovies = async (): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting top rated movies:', error);
      return [];
    }
  };

  const getUpcomingMovies = async (): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting upcoming movies:', error);
      return [];
    }
  };

  const searchTVShows = async (query: string): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&query=${encodeURIComponent(query)}&language=en-US`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching TV shows:', error);
      return [];
    }
  };

  const getPopularTVShows = async (): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting popular TV shows:', error);
      return [];
    }
  };

  const getTopRatedTVShows = async (): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting top rated TV shows:', error);
      return [];
    }
  };

  const getOnTheAirTVShows = async (): Promise<MovieData[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25'}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting on the air TV shows:', error);
      return [];
    }
  };

  const value = {
    movies,
    trending,
    popular,
    loading,
    searchMovies,
    getMovieById,
    getPopularMovies,
    getTrendingMovies,
    getTopRatedMovies,
    getUpcomingMovies,
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
}