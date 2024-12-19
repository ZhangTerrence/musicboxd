import { NextResponse } from "next/server";

import SpotifyWebApi from "spotify-web-api-node";

// import mongoose from "mongoose";
import Review from "@/lib/models/review";
import User from "@/lib/models/user";

// const MONGODB_URI = process.env.MONGODB_URI;

// const connectToDatabase = async () => {
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to MongoDB");
//   }
// };

export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
  }

  try {
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    const initializeSpotifyToken = async () => {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body.access_token);
    };

    if (!spotifyApi.getAccessToken()) {
      await initializeSpotifyToken();
    }

    const track = await spotifyApi.getTrack(id, { market: "US" });

    const song = {
      id: track.body.id,
      name: track.body.name,
      artists: track.body.artists.map((artist) => artist.name),
      album: track.body.album.name,
      image: track.body.album.images[0]?.url || null,
      release_date: track.body.album.release_date,
      duration: track.body.duration_ms,
      preview_url: track.body.preview_url || null,
    };

    // await connectToDatabase();

    const reviews = await Review.find({ song_id: id });

    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findById(review.user_id).exec();
        return {
          id: review._id,
          text: review.text,
          rating: review.rating,
          created_at: review.created_at,
          user: user ? { id: user._id, name: user.username } : { id: null, name: "Unknown User" },
        };
      }),
    );

    return NextResponse.json({ song, reviews: enrichedReviews });
  } catch (error) {
    console.error("Error fetching song details:", error);
    return NextResponse.json({ error: "Failed to fetch song details" }, { status: 500 });
  }
};
