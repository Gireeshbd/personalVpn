import type { ExtensionMessage, MessageResponse } from '@shared/types';

/**
 * Send a message to the background service worker
 */
export async function sendMessage<T = any>(
  message: ExtensionMessage
): Promise<MessageResponse<T>> {
  try {
    const response = await chrome.runtime.sendMessage(message);

    // Handle case where no listener replies (response is undefined)
    if (!response) {
      return {
        success: false,
        error: 'No response from background script',
      };
    }

    return response;
  } catch (error) {
    console.error('Message send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add a message listener
 */
export function addMessageListener(
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(callback);
}

/**
 * Remove a message listener
 */
export function removeMessageListener(
  callback: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.removeListener(callback);
}
