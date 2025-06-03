export function useChat() {
  // Implement resetChatCounts to avoid errors in chat page
  const resetChatCounts = () => {
    // This can be expanded to reset chat notification counts if implemented
    // For now, it's a no-op function to prevent errors
  };

  return {
    resetChatCounts,
  };
}
