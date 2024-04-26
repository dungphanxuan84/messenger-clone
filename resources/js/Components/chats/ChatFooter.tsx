import { saveMessage } from "@/api/chat-messages";
import { useAppContext } from "@/contexts/app-context";
import { useChatContext } from "@/contexts/chat-context";
import { useChatMessageContext } from "@/contexts/chat-message-context";
import clsx from "clsx";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import { BsEmojiSmile, BsPlusLg } from "react-icons/bs";

export default function ChatFooter() {
  const { theme } = useAppContext();
  const { refetchChats } = useChatContext();
  const { user, messages, setMessages } = useChatMessageContext();

  const [message, setMessage] = useState("");
  const [textareaHeight, setTextareaHeight] = useState(48);
  const [processing, setProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isOpenEmoji, setIsOpenEmoji] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const onSelectFile = () => {};

  const handleOnKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const onPressBackspace = e.key === "Backspace";
    const onPressEnter = e.key === "Enter";

    if (onPressEnter && !e.shiftKey) {
      e.preventDefault();
      handleOnSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }

    if (onPressBackspace) {
      const target = e.target as HTMLTextAreaElement;
      const lines = target.validationMessage.split("\n");

      if (target.offsetHeight > 48) {
        if (lines[lines.length - 1] === "") {
          setTextareaHeight((prev) => prev - 24);
        }
      }
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      const { scrollHeight, clientHeight } = textareaRef.current;
      if (scrollHeight !== clientHeight) {
        setTextareaHeight(scrollHeight + 4);
      }
    }
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);

    if (message.length === 0) {
      return;
    }

    saveMessage({ user, message }).then((response) => {
      setMessage("");
      setTextareaHeight(48);
      setIsOpenEmoji(false);
      textareaRef.current?.focus();

      const data = response.data.data;

      setMessages([...messages, data]);
      refetchChats();
    });
  };

  const toggleEmoji = () => {
    setIsOpenEmoji(!isOpenEmoji);
  };

  const handleOnEmojiClick = (emoji: string) => {
    setMessage((prevMsg) => prevMsg + emoji);
  };

  return (
    <form
      className="flex items-end gap-2 bg-background p-2 text-foreground"
      onSubmit={handleOnSubmit}
    >
      <label
        htmlFor="file"
        className="mb-1 cursor-pointer rounded-full p-2 text-primary transition-all hover:bg-secondary focus:bg-secondary"
      >
        <BsPlusLg className="h-6 w-6" />
        <input
          type="file"
          className="hidden"
          id="file"
          multiple
          onChange={onSelectFile}
        />
      </label>

      <div className="relative flex flex-1 items-end">
        <button
          type="button"
          className="absolute right-2 mb-3 text-primary"
          onClick={toggleEmoji}
        >
          <BsEmojiSmile className="h-6 w-6" />
        </button>

        <div
          className={clsx(
            "absolute bottom-14 right-0 z-10",
            isOpenEmoji ? "block" : "hidden",
          )}
        >
          <EmojiPicker
            theme={(theme === "system" ? "auto" : theme) as Theme}
            skinTonesDisabled={true}
            height={400}
            onEmojiClick={({ emoji }) => handleOnEmojiClick(emoji)}
          ></EmojiPicker>
        </div>

        <textarea
          placeholder="Aa"
          className="max-h-[7.5rem] w-full resize-none rounded-xl border border-secondary bg-secondary pr-10 text-foreground focus:border-transparent focus:ring-transparent"
          value={message}
          onKeyDown={handleOnKeyDown}
          onChange={handleOnChange}
          ref={textareaRef}
          style={{
            height: `${textareaHeight}px`,
          }}
        />
      </div>

      <button
        className={clsx(
          "mb-1 flex rounded-full p-2 text-primary transition-all disabled:cursor-not-allowed",
          message.trim().length === 0 &&
            "hover:bg-secondary focus:bg-secondary",
          message.trim().length > 0 && "bg-primary !text-white",
        )}
      >
        <BiSend className="h-6 w-6" />
      </button>
    </form>
  );
}