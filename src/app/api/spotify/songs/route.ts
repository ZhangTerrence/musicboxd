import { NextResponse } from "next/server";

import dotenv from "dotenv";
// import mongoose from "mongoose";
import SpotifyWebApi from "spotify-web-api-node";
import { v4 as uuid } from "uuid";

import Song from "@/lib/models/song";

dotenv.config();

// const connectToDatabase = async () => {
//   if (!mongoose.connection.readyState) {
//     await mongoose.connect(process.env.MONGODB_URI!, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//   }
// };

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Missing 'query paramenter in request" }, { status: 400 });
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    const initializeSpotifyToken = async () => {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body.access_token);
    };

    if (!spotifyApi.getAccessToken()) {
      console.log("Access token missing, initializing...");
      await initializeSpotifyToken();
    }

    const data = await spotifyApi.searchTracks(query);

    const songs = data.body.tracks!.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name), //
      album: track.album.name,
      image: track.album.images[0]?.url,
      preview_url: track.preview_url,
    }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    // await connectToDatabase();

    const { name, artist, album, spotify_id } = await request.json();

    if (!name || !artist || !album || !spotify_id) {
      return NextResponse.json({ error: "Missing required fields in request body" }, { status: 400 });
    }

    // Check if the song already exists
    const existingSong = await Song.findOne({ spotify_id });
    if (existingSong) {
      return NextResponse.json({ message: "Song already exists" });
    }

    // Create and save the new song
    const newSong = new Song({
      _id: uuid(),
      name,
      artist,
      album,
      spotify_id,
    });
    await newSong.save();

    return NextResponse.json({ message: "Song saved successfully" });
  } catch (error) {
    console.error("Error saving song:", error);
    return NextResponse.json({ error: "Failed to save song" }, { status: 500 });
  }
};
