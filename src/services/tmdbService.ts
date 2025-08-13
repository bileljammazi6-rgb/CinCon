import { MovieData, TMDBResponse } from '../types';

class TMDBService {
  private apiKey = ((import.meta as any).env?.VITE_TMDB_API_KEY as string | undefined);
  private baseUrl = 'https://api.themoviedb.org/3';

  async searchMovie(query: string): Promise<MovieData | null> {
    try {
      if (!this.apiKey) throw new Error('TMDB API key missing. Set VITE_TMDB_API_KEY.');
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
      if (!this.apiKey) throw new Error('TMDB API key missing. Set VITE_TMDB_API_KEY.');
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
      if (!this.apiKey) throw new Error('TMDB API key missing. Set VITE_TMDB_API_KEY.');
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

  async getWatchProviders(movieId: number, region = 'US'): Promise<{ link?: string; providers?: { provider_name: string; logo_path?: string }[] }> {
    try {
      if (!this.apiKey) throw new Error('TMDB API key missing. Set VITE_TMDB_API_KEY.');
      const response = await fetch(
        `${this.baseUrl}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
      );
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
      const data = await response.json();
      const regionData = data.results?.[region];
      const link = regionData?.link as string | undefined;
      const providers = (regionData?.flatrate || []) as { provider_name: string; logo_path?: string }[];
      return { link, providers };
    } catch (e) {
      console.error('TMDB Providers Error:', e);
      return {};
    }
  }
}

export const tmdbService = new TMDBService();