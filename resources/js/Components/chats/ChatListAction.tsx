import { Chat } from "@/types/chat";
import Dropdown, { useDropdownContext } from "@/components/Dropdown";
import { useRef } from "react";
import clsx from "clsx";
import { BsArchive, BsCheck2, BsThreeDots, BsXLg } from "react-icons/bs";
import { useAppContext } from "@/contexts/app-context";
import { archiveChat, markAsRead, markAsUnread } from "@/api/chats";
import { useChatContext } from "@/contexts/chat-context";
import { useModalContext } from "@/contexts/modal-context";

type ActionProps = {
  chat: Chat;
};

export default function ChatListAction({ chat }: ActionProps) {
  return (
    <div className="absolute right-8 shrink-0">
      <Dropdown>
        <Action chat={chat} />
      </Dropdown>
    </div>
  );
}

const Action = ({ chat }: ActionProps) => {
  const { auth } = useAppContext();
  const { chats, setChats, refetchChats } = useChatContext();
  const { openModal } = useModalContext();
  const { open } = useDropdownContext();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPosition =
    (dropdownRef.current?.getBoundingClientRect().bottom || 0) <
    window.innerHeight - 100;

  const handleMarkAsRead = () => {
    markAsRead(chat).then(() => {
      setChats(
        chats.map((c) => {
          if (c.id === chat.id) {
            c.is_read = true;
          }

          return c;
        }),
      );
    });
  };

  const handleMarkAsUnread = () => {
    markAsUnread(chat).then(() => {
      setChats(
        chats.map((c) => {
          if (c.id === chat.id) {
            c.is_read = false;
          }

          return c;
        }),
      );
    });
  };

  const handleArchiveChat = () => {
    archiveChat(chat).then(() => {
      refetchChats();
    });
  };

  const deleteChatConfirmation = () => {
    openModal({
      view: "DELETE_CHAT_CONFIRMATION",
      size: "lg",
      payload: chat,
    });
  };

  return (
    <div ref={dropdownRef}>
      <Dropdown.Trigger>
        <button
          type="button"
          className={clsx(
            "rounded-full border border-secondary bg-background p-1.5 shadow-sm group-hover:visible group-hover:flex",
            open ? "visible" : "invisible",
          )}
        >
          <BsThreeDots className="text-secondary-foreground" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content
        align={dropdownPosition ? "right" : "top-right"}
        contentClasses={dropdownPosition ? "" : "mb-7"}
      >
        {auth.id !== chat.id && auth.id !== chat.from_id && (
          <Dropdown.Button
            onClick={chat.is_read ? handleMarkAsUnread : handleMarkAsRead}
          >
            <div className="flex items-center gap-2">
              <BsCheck2 className="-ml-1 text-lg" />
              Mark as {chat.is_read ? "Unread" : "Read"}
            </div>
          </Dropdown.Button>
        )}

        <Dropdown.Button onClick={handleArchiveChat}>
          <div className="flex items-center gap-2">
            <BsArchive className="-ml-1 text-lg" />
            Archive Chat
          </div>
        </Dropdown.Button>

        <Dropdown.Button onClick={deleteChatConfirmation}>
          <div className="flex items-center gap-2">
            <BsXLg className="-ml-1 text-lg" />
            Delete Chat
          </div>
        </Dropdown.Button>
      </Dropdown.Content>
    </div>
  );
};
