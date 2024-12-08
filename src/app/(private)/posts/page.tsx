import { redirect } from "next/navigation";

import { type Session } from "lucia";

import ForumPage from "@/components/ForumPage";

import { getSession } from "@/lib/lucia";
import Post, { type IPost } from "@/lib/models/post";
import User, { type IUser } from "@/lib/models/user";

export const metadata = {
  title: "Posts",
};

export default async function PostPage() {
  const session: Session = await getSession();

  if (!session) {
    return redirect("/login");
  }

  try {
    let allPosts = (await Post.find().exec()) as IPost[];
    if (!allPosts) {
      return <div>No Posts!</div>;
    }

    allPosts = allPosts.map((post) => post.toObject());

    const usernames: string[] = [];
    for (let i = 0; i <= allPosts.length - 1; i++) {
      const user = (await User.findById(allPosts[i].user_id).exec()) as IUser;
      if (!user) {
        usernames.push("Username Not Found");
      } else {
        usernames.push(user.username);
      }
    }

    return (
      <main className="flex min-h-screen w-screen flex-col items-center justify-center gap-y-4">
        <h1 className="text-4xl">Forum Page</h1>
        <ForumPage posts={allPosts} usernames={usernames} />
      </main>
    );
  } catch (e) {
    console.log(e);
    return <div>An Error Occurred.</div>;
  }
}
