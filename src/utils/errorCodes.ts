/**
 * Centralized Error Codes
 *
 * Provides consistent error handling across the application with descriptive codes.
 */

export enum ErrorCode {
  // Network Errors (1xxx)
  NETWORK_UNAVAILABLE = "ERR_1001",
  NETWORK_TIMEOUT = "ERR_1002",
  NETWORK_REQUEST_FAILED = "ERR_1003",

  // API/Data Parsing Errors (2xxx)
  RSS_PARSE_FAILED = "ERR_2001",
  XML_INVALID = "ERR_2002",
  HTML_PARSE_FAILED = "ERR_2003",
  JSON_PARSE_FAILED = "ERR_2004",
  INVALID_ARTICLE_DATA = "ERR_2005",

  // Storage Errors (3xxx)
  STORAGE_READ_FAILED = "ERR_3001",
  STORAGE_WRITE_FAILED = "ERR_3002",
  STORAGE_DELETE_FAILED = "ERR_3003",
  STORAGE_QUOTA_EXCEEDED = "ERR_3004",

  // Authentication Errors (4xxx)
  AUTH_FAILED = "ERR_4001",
  AUTH_CANCELLED = "ERR_4002",
  AUTH_INVALID_CREDENTIALS = "ERR_4003",
  APPLE_SIGNIN_UNAVAILABLE = "ERR_4004",
  APPLE_SIGNIN_FAILED = "ERR_4005",

  // Content Loading Errors (5xxx)
  ARTICLE_NOT_FOUND = "ERR_5001",
  ARTICLE_LOAD_FAILED = "ERR_5002",
  IMAGE_LOAD_FAILED = "ERR_5003",
  FULL_STORY_UNAVAILABLE = "ERR_5004",

  // AI/Summarization Errors (6xxx)
  AI_SERVICE_UNAVAILABLE = "ERR_6001",
  SUMMARIZATION_FAILED = "ERR_6002",
  AI_RATE_LIMIT = "ERR_6003",

  // General Errors (9xxx)
  UNKNOWN_ERROR = "ERR_9001",
  FEATURE_NOT_IMPLEMENTED = "ERR_9002",
  INVALID_OPERATION = "ERR_9003",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: number;
  recoverable: boolean;
  userMessage: string; // User-friendly error message
}

export class ErrorHandler {
  /**
   * Creates a standardized error object
   */
  static createError(
    code: ErrorCode,
    message: string,
    details?: string,
    recoverable: boolean = true,
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: Date.now(),
      recoverable,
      userMessage: this.getUserMessage(code),
    };
  }

  /**
   * Get user-friendly message for error code
   */
  static getUserMessage(code: ErrorCode): string {
    switch (code) {
      // Network
      case ErrorCode.NETWORK_UNAVAILABLE:
        return "No internet connection. Please check your network settings.";
      case ErrorCode.NETWORK_TIMEOUT:
        return "Request timed out. Please try again.";
      case ErrorCode.NETWORK_REQUEST_FAILED:
        return "Failed to connect to server. Please try again later.";

      // Parsing
      case ErrorCode.RSS_PARSE_FAILED:
        return "Unable to load news feed. The source may be temporarily unavailable.";
      case ErrorCode.XML_INVALID:
      case ErrorCode.HTML_PARSE_FAILED:
        return "Unable to read article content. The format may not be supported.";
      case ErrorCode.INVALID_ARTICLE_DATA:
        return "Article data is incomplete or corrupted.";

      // Storage
      case ErrorCode.STORAGE_READ_FAILED:
        return "Failed to load saved data.";
      case ErrorCode.STORAGE_WRITE_FAILED:
        return "Failed to save. Please check device storage.";
      case ErrorCode.STORAGE_QUOTA_EXCEEDED:
        return "Storage limit reached. Please delete some saved articles.";

      // Auth
      case ErrorCode.AUTH_FAILED:
        return "Authentication failed. Please try again.";
      case ErrorCode.AUTH_CANCELLED:
        return "Sign in was cancelled.";
      case ErrorCode.APPLE_SIGNIN_UNAVAILABLE:
        return "Sign in with Apple is not available on this device.";
      case ErrorCode.APPLE_SIGNIN_FAILED:
        return "Sign in with Apple failed. Please try again.";

      // Content
      case ErrorCode.ARTICLE_NOT_FOUND:
        return "Article not found.";
      case ErrorCode.ARTICLE_LOAD_FAILED:
        return "Failed to load article. Please try again.";
      case ErrorCode.FULL_STORY_UNAVAILABLE:
        return "Full story is not available from this source.";

      // AI
      case ErrorCode.AI_SERVICE_UNAVAILABLE:
        return "AI summarization is temporarily unavailable.";
      case ErrorCode.SUMMARIZATION_FAILED:
        return "Failed to generate summary. Please try again.";
      case ErrorCode.AI_RATE_LIMIT:
        return "Too many requests. Please wait a moment and try again.";

      // General
      case ErrorCode.FEATURE_NOT_IMPLEMENTED:
        return "This feature is coming soon!";
      case ErrorCode.UNKNOWN_ERROR:
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  /**
   * Log error for debugging
   */
  static logError(error: AppError, context?: string) {
    console.error(
      `[${error.code}] ${context ? `${context}: ` : ""}${error.message}`,
      error.details ? `\nDetails: ${error.details}` : "",
    );
  }

  /**
   * Convert native error to AppError
   */
  static fromNativeError(error: any, defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR): AppError {
    if (error?.code && Object.values(ErrorCode).includes(error.code)) {
      return error as AppError;
    }

    let code = defaultCode;
    const message = error?.message || "Unknown error";

    // Attempt to categorize based on error message
    if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch")) {
      code = ErrorCode.NETWORK_REQUEST_FAILED;
    } else if (message.toLowerCase().includes("parse") || message.toLowerCase().includes("json")) {
      code = ErrorCode.JSON_PARSE_FAILED;
    } else if (
      message.toLowerCase().includes("storage") ||
      message.toLowerCase().includes("asyncstorage")
    ) {
      code = ErrorCode.STORAGE_READ_FAILED;
    }

    return this.createError(code, message, error?.stack);
  }
}
