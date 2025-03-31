import { useCallback, useEffect, useRef } from "react";

export function useScrollBehavior() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollArea;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 1;
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const scrollToBottomIfNeeded = useCallback(() => {
    if (shouldScrollRef.current && scrollAreaRef.current) {
      handleScrollToBottom();
    }
  }, [handleScrollToBottom]);

  return {
    scrollAreaRef,
    handleScrollToBottom,
    scrollToBottomIfNeeded,
  };
}
