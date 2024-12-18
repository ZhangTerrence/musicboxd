"use client";

import React, { useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { type IMessage } from "@/lib/models/message";

import { useChat } from "@/hooks/useChat";

type ChannelMessagesProps = {
  userId: string;
  username: string;
  channelId: string;
  messages: {
    message: IMessage;
    username: string;
  }[];
};

export default function ChannelMessages(props: ChannelMessagesProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [messages, sendMessage] = useChat(
    props.channelId,
    props.messages.map((e) => {
      return {
        id: e.message._id as string,
        text: e.message.text,
        ownerId: e.message.user_id,
        ownerUsername: e.username,
        createdAt: e.message.created_at,
      };
    }),
  );

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) {
      return;
    }

    await sendMessage(inputRef.current.value, props.userId, props.username);
    inputRef.current.value = "";
  };

  return (
    <div className="flex h-full w-full flex-col bg-spotify-black text-spotify-white">
      <div className="grow overflow-x-hidden overflow-y-scroll p-2 bg-spotify-black text-spotify-white">
        {messages.map((message) => {
          return (
            <div className="bg-spotify-black text-spotify-white" key={message.id}>
              <div className="flex gap-x-4">
                <Link className="hover:underline" href={`/profile/${message.ownerId}`}>
                  <strong className="text-spotify-green italic">{message.ownerUsername}</strong>
                </Link>
                <span className="">{new Date(message.createdAt).toLocaleDateString()}</span>
              </div>
              <p>{message.text}</p>
              <br></br>
            </div>
          );
        })}
        <div ref={bottomRef} className="clear-both"></div>
      </div>
      <form className="flex w-full" onSubmit={(e) => send(e)}>
        <input className="grow border border-solid border-black p-2 bg-textbox-gray text-spotify-black" type="text" ref={inputRef} />
        <button className="w-fit border border-solid border-black p-2 hover:bg-spotify-white font-bold bg-spotify-green text-spotify-black" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
