export interface Message {
  id: string;
  type: 'text' | 'movie' | 'image';
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
  movieData?: MovieData;
}

export interface MovieData {
  id?: number;
  title: string;
  overview: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  downloadLinks?: string[];
}

export interface TMDBResponse {
  results: MovieData[];
  total_results: number;
}