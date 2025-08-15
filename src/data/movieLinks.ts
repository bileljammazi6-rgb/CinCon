export interface SeriesEpisode {
  episode: number;
  season?: number;
  title: string;
  links: string[];
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
  isSeries?: boolean;
  episodes?: SeriesEpisode[];
  tmdbId?: number; // TMDB ID for fetching images
}

export const movieLinks: Record<string, MovieData> = {
  "mobland": {
    title: "Mobland",
    overview: "A gripping crime drama series following the rise and fall of organized crime families.",
    poster_path: "/mobland-poster.jpg",
    release_date: "2024",
    vote_average: 8.7,
    genre_ids: [18, 80, 9648],
    isSeries: true,
    tmdbId: 123456, // Placeholder TMDB ID
    episodes: [
      {
        episode: 1,
        season: 1,
        title: "Episode 1",
        links: ["https://pixeldrain.com/api/file/c1yALumo"]
      },
      {
        episode: 2,
        season: 1,
        title: "Episode 2", 
        links: ["https://pixeldrain.com/api/file/5vByKXNB"]
      },
      {
        episode: 3,
        season: 1,
        title: "Episode 3",
        links: ["https://pixeldrain.com/api/file/qwZSeP5c"]
      },
      {
        episode: 4,
        season: 1,
        title: "Episode 4",
        links: ["https://pixeldrain.com/api/file/9F3gFRvF"]
      },
      {
        episode: 5,
        season: 1,
        title: "Episode 5",
        links: ["https://pixeldrain.com/api/file/2untTLEh"]
      },
      {
        episode: 6,
        season: 1,
        title: "Episode 6",
        links: ["https://pixeldrain.com/api/file/4JuMeWG8"]
      },
      {
        episode: 7,
        season: 1,
        title: "Episode 7",
        links: ["https://pixeldrain.com/api/file/ykgLmxs9"]
      },
      {
        episode: 8,
        season: 1,
        title: "Episode 8",
        links: ["https://pixeldrain.com/api/file/FKPTCSaQ"]
      },
      {
        episode: 9,
        season: 1,
        title: "Episode 9",
        links: ["https://pixeldrain.com/api/file/yAcYYP26"]
      }
    ]
  },
  "all of us are dead": {
    title: "All of Us Are Dead",
    overview: "A Korean zombie apocalypse series where students must fight to survive.",
    poster_path: "/all-of-us-are-dead-poster.jpg",
    release_date: "2022",
    vote_average: 8.3,
    genre_ids: [27, 18, 10759],
    isSeries: true,
    tmdbId: 123457,
    episodes: [
      {
        episode: 1,
        season: 1,
        title: "Episode 1",
        links: ["https://pixeldrain.com/api/file/WG3NJoAK"]
      },
      {
        episode: 2,
        season: 1,
        title: "Episode 2",
        links: ["https://pixeldrain.com/api/file/xv1y74MP"]
      },
      {
        episode: 3,
        season: 1,
        title: "Episode 3",
        links: ["https://pixeldrain.com/api/file/TKkpUnwJ"]
      },
      {
        episode: 4,
        season: 1,
        title: "Episode 4",
        links: ["https://pixeldrain.com/api/file/2GDstPyV"]
      },
      {
        episode: 5,
        season: 1,
        title: "Episode 5",
        links: ["https://pixeldrain.com/api/file/EokWU4JK"]
      }
    ]
  },
  "the queen's gambit": {
    title: "The Queen's Gambit",
    overview: "A chess prodigy's rise to fame while battling addiction.",
    poster_path: "/queens-gambit-poster.jpg",
    release_date: "2020",
    vote_average: 8.6,
    genre_ids: [18, 10759],
    isSeries: true,
    tmdbId: 123458,
    episodes: [
      {
        episode: 1,
        season: 1,
        title: "Episode 1",
        links: ["https://pixeldrain.com/api/file/452dw9vK"]
      },
      {
        episode: 2,
        season: 1,
        title: "Episode 2",
        links: ["https://pixeldrain.com/api/file/EE4Sx96w"]
      },
      {
        episode: 3,
        season: 1,
        title: "Episode 3",
        links: ["https://pixeldrain.com/api/file/v96e4qxD"]
      },
      {
        episode: 4,
        season: 1,
        title: "Episode 4",
        links: ["https://pixeldrain.com/api/file/YYa121XQ"]
      },
      {
        episode: 5,
        season: 1,
        title: "Episode 5",
        links: ["https://pixeldrain.com/api/file/22icFfDJ"]
      }
    ]
  },
  "attack on titan": {
    title: "Attack on Titan",
    overview: "Humanity's last stand against giant Titans in this epic anime series.",
    poster_path: "/attack-on-titan-poster.jpg",
    release_date: "2013",
    vote_average: 9.0,
    genre_ids: [16, 10759, 10765],
    isSeries: true,
    tmdbId: 123459,
    episodes: [
      {
        episode: 1,
        season: 1,
        title: "Episode 1",
        links: ["https://pixeldrain.com/api/file/jiAm7kxg"]
      },
      {
        episode: 2,
        season: 1,
        title: "Episode 2",
        links: ["https://pixeldrain.com/api/file/SBVUfsvw"]
      },
      {
        episode: 3,
        season: 1,
        title: "Episode 3",
        links: ["https://pixeldrain.com/api/file/RnKc3j6j"]
      },
      {
        episode: 4,
        season: 1,
        title: "Episode 4",
        links: ["https://pixeldrain.com/api/file/TgA7Nf9p"]
      },
      {
        episode: 5,
        season: 1,
        title: "Episode 5",
        links: ["https://pixeldrain.com/api/file/5YNAWddf"]
      },
      {
        episode: 6,
        season: 1,
        title: "Episode 6",
        links: ["https://pixeldrain.com/api/file/4H5xGTt5"]
      }
    ]
  },
  "interstellar": {
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster_path: "/interstellar-poster.jpg",
    release_date: "2014",
    vote_average: 8.6,
    genre_ids: [12, 18, 878],
    isSeries: false,
    tmdbId: 157336,
    downloadLinks: ["https://pixeldrain.com/api/file/AeJScF7G"]
  },
  "17 again": {
    title: "17 Again",
    overview: "A man gets a chance to relive his high school days and correct the mistakes he made.",
    poster_path: "/17-again-poster.jpg",
    release_date: "2009",
    vote_average: 6.4,
    genre_ids: [35, 14, 10749],
    isSeries: false,
    tmdbId: 12445,
    downloadLinks: ["https://pixeldrain.com/api/file/DNGsiNcv"]
  },
  "mission impossible final reckoning": {
    title: "Mission: Impossible - Dead Reckoning Part One",
    overview: "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity.",
    poster_path: "/mission-impossible-poster.jpg",
    release_date: "2023",
    vote_average: 7.7,
    genre_ids: [28, 12, 53],
    isSeries: false,
    tmdbId: 575264,
    downloadLinks: ["https://pixeldrain.com/api/file/ByucVF3t"]
  },
  "inception": {
    title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/inception-poster.jpg",
    release_date: "2010",
    vote_average: 8.8,
    genre_ids: [28, 18, 878],
    isSeries: false,
    tmdbId: 27205,
    downloadLinks: ["https://pixeldrain.com/api/file/gknricf2"]
  },
  "the dark knight": {
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster_path: "/dark-knight-poster.jpg",
    release_date: "2008",
    vote_average: 9.0,
    genre_ids: [28, 18, 80],
    isSeries: false,
    tmdbId: 155,
    downloadLinks: ["https://pixeldrain.com/api/file/2XxUnAiL"]
  },
  "pulp fiction": {
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster_path: "/pulp-fiction-poster.jpg",
    release_date: "1994",
    vote_average: 8.9,
    genre_ids: [53, 80],
    isSeries: false,
    tmdbId: 680,
    downloadLinks: ["https://pixeldrain.com/api/file/xhmTwHc5"]
  },
  "the matrix": {
    title: "The Matrix",
    overview: "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.",
    poster_path: "/matrix-poster.jpg",
    release_date: "1999",
    vote_average: 8.7,
    genre_ids: [28, 878],
    isSeries: false,
    tmdbId: 603,
    downloadLinks: ["https://pixeldrain.com/api/file/wh3iPhbw"]
  },
  "fight club": {
    title: "Fight Club",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    poster_path: "/fight-club-poster.jpg",
    release_date: "1999",
    vote_average: 8.8,
    genre_ids: [18],
    isSeries: false,
    tmdbId: 550,
    downloadLinks: ["https://pixeldrain.com/api/file/1GSreeCN"]
  },
  "parasite": {
    title: "Parasite",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster_path: "/parasite-poster.jpg",
    release_date: "2019",
    vote_average: 8.6,
    genre_ids: [18, 53],
    isSeries: false,
    tmdbId: 496243,
    downloadLinks: ["https://pixeldrain.com/api/file/z3x7ufGR"]
  },
  "la la land": {
    title: "La La Land",
    overview: "A jazz pianist falls for an aspiring actress in Los Angeles.",
    poster_path: "/la-la-land-poster.jpg",
    release_date: "2016",
    vote_average: 8.0,
    genre_ids: [35, 18, 10402, 10749],
    isSeries: false,
    tmdbId: 313369,
    downloadLinks: ["https://pixeldrain.com/api/file/9eMsbMaT"]
  },
  "spirited away": {
    title: "Spirited Away",
    overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.",
    poster_path: "/spirited-away-poster.jpg",
    release_date: "2001",
    vote_average: 8.6,
    genre_ids: [16, 12, 14, 10751],
    isSeries: false,
    tmdbId: 129,
    downloadLinks: ["https://pixeldrain.com/api/file/SwBc7Xmn"]
  },
  "your name": {
    title: "Your Name",
    overview: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    poster_path: "/your-name-poster.jpg",
    release_date: "2016",
    vote_average: 8.4,
    genre_ids: [16, 18, 10749, 14],
    isSeries: false,
    tmdbId: 372058,
    downloadLinks: ["https://pixeldrain.com/api/file/i6QpqBUi"]
  },
  "how to train your dragon": {
    title: "How to Train Your Dragon",
    overview: "A hapless young Viking who aspires to hunt dragons becomes the unlikely friend of a young dragon himself, and learns there may be more to the creatures than he initially assumed.",
    poster_path: "/how-to-train-dragon-poster.jpg",
    release_date: "2010",
    vote_average: 8.1,
    genre_ids: [16, 12, 10751],
    isSeries: false,
    tmdbId: 10191,
    downloadLinks: ["https://pixeldrain.com/api/file/7hZHRPm8"]
  }
};

// Helper function to find movie links by title
export const findMovieLinks = (title: string): string[] => {
  const normalizedTitle = title.toLowerCase().trim();
  
  // Direct match
  if (movieLinks[normalizedTitle]) {
    const movie = movieLinks[normalizedTitle];
    if (movie.isSeries && movie.episodes) {
      // For series, return all episode links
      return movie.episodes.flatMap(ep => ep.links);
    } else if (movie.downloadLinks) {
      return movie.downloadLinks;
    }
  }
  
  // Partial match
  for (const [key, movie] of Object.entries(movieLinks)) {
    if (key.includes(normalizedTitle) || normalizedTitle.includes(key)) {
      if (movie.isSeries && movie.episodes) {
        return movie.episodes.flatMap(ep => ep.links);
      } else if (movie.downloadLinks) {
        return movie.downloadLinks;
      }
    }
  }
  
  return [];
};

// Get all available movies and series
export const getAvailableMovies = (): MovieData[] => {
  return Object.values(movieLinks);
};

// Get only series
export const getAvailableSeries = (): MovieData[] => {
  return Object.values(movieLinks).filter(movie => movie.isSeries);
};

// Get only movies (not series)
export const getAvailableMoviesOnly = (): MovieData[] => {
  return Object.values(movieLinks).filter(movie => !movie.isSeries);
};