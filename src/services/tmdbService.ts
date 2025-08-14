import { MovieData, TMDBResponse } from '../types';

class TMDBService {
  private apiKey = import.meta.env.VITE_TMDB_API_KEY || '0a7ef230ab60a26cca44c7d8a6d24c25';
  private baseUrl = 'https://api.themoviedb.org/3';

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=en-US`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB API request failed:', error);
      throw error;
    }
  }

  async getTrendingMovies(): Promise<MovieData[]> {
    try {
      const data = await this.makeRequest<TMDBResponse>('/trending/movie/week');
      return data.results || [];
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return [];
    }
  }

  async getPopularMovies(): Promise<MovieData[]> {
    try {
      const data = await this.makeRequest<TMDBResponse>('/movie/popular');
      return data.results || [];
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  }

  async searchMovies(query: string): Promise<MovieData[]> {
    if (!query.trim()) return [];
    
    try {
      const data = await this.makeRequest<TMDBResponse>(`/search/movie?query=${encodeURIComponent(query)}`);
      return data.results || [];
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }

  async getMovieById(id: number): Promise<MovieData | null> {
    try {
      const data = await this.makeRequest<MovieData>(`/movie/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      return null;
    }
  }
}

export const tmdbService = new TMDBService();