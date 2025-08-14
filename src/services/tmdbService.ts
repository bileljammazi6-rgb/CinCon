import { MovieData, TMDBResponse } from '../types';

class TMDBService {
  private apiKey = import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25';
  private baseUrl = 'https://api.themoviedb.org/3';

  async searchMovie(query: string): Promise<MovieData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=en-US`
      );

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }

      return null;
    } catch (error) {
      console.error('TMDB Search Error:', error);
      return null;
    }
  }

  async getPopularMovies(): Promise<MovieData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=en-US&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBResponse = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('TMDB Popular Movies Error:', error);
      return [];
    }
  }

  async getTrendingMovies(): Promise<MovieData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`);
      }

      const data: TMDBResponse = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('TMDB Trending Movies Error:', error);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();