import React from 'react';
import { Heart, Plus } from 'lucide-react';

export function MyList() {
  // This would typically fetch from user's saved list
  const savedItems: any[] = [];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">My List</h1>
        <p className="text-gray-400 text-lg">Your personal collection of favorites</p>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Your list is empty</h3>
          <p className="text-gray-400 mb-6">Start building your collection by adding movies and TV shows you love</p>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto">
            <Plus className="h-5 w-5" />
            Discover Content
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {savedItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Movie card content would go here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}