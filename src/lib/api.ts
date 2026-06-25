import { API_BASE_URL } from "./constants";
import type {
  ApiError,
  CreateDeckBody,
  CreateFlashcardBody,
  Deck,
  DeckListResponse,
  DeckResponse,
  DraftDeckResponse,
  Flashcard,
  FlashcardListResponse,
  FlashcardResponse,
  SignInBody,
  SignInResponse,
  SignUpBody,
  AdminSetupBody,
  UpdateFlashcardsStatusBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  MessageResponse,
} from "@/types/api";

class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    return data.message || data.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiClientError(response.status, await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  signIn(body: SignInBody) {
    return request<SignInResponse>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signUp(body: SignUpBody) {
    return request<SignInResponse>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signUpAdmin(body: AdminSetupBody) {
    return request<SignInResponse>("/api/auth/sign-up-admin", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  promoteToAdmin(body: AdminSetupBody) {
    return request<SignInResponse>("/api/auth/promote-to-admin", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signOut(token: string) {
    return request<{ message: string }>(
      "/api/auth/sign-out",
      { method: "POST" },
      token,
    );
  },

  forgotPassword(body: ForgotPasswordBody) {
    return request<MessageResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  resetPassword(body: ResetPasswordBody) {
    return request<MessageResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listPublishedDecks() {
    return request<DeckListResponse>("/api/decks");
  },

  listPublishedFlashcards(deckId: string) {
    return request<FlashcardListResponse>(`/api/decks/${deckId}/flashcards`);
  },

  createDeck(body: CreateDeckBody, token: string) {
    return request<DeckResponse>(
      "/api/admin/decks",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  publishDeck(id: string, token: string) {
    return request<DeckResponse>(
      `/api/admin/decks/${id}/publish`,
      { method: "PUT" },
      token,
    );
  },

  draftDeck(id: string, token: string) {
    return request<DraftDeckResponse>(
      `/api/admin/decks/${id}/draft`,
      { method: "PUT" },
      token,
    );
  },

  createFlashcard(body: CreateFlashcardBody, token: string) {
    return request<FlashcardResponse>(
      "/api/admin/flashcards",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  // Extended admin endpoints — gracefully handled when backend adds them
  async listAdminDecks(token: string): Promise<Deck[]> {
    try {
      const data = await request<{ decks: Deck[] }>(
        "/api/admin/decks",
        {},
        token,
      );
      return data.decks;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        const published = await api.listPublishedDecks();
        return published.decks;
      }
      throw error;
    }
  },

  async updateDeck(
    id: string,
    body: Partial<CreateDeckBody>,
    token: string,
  ): Promise<Deck> {
    try {
      const data = await request<DeckResponse>(
        `/api/admin/decks/${id}`,
        { method: "PUT", body: JSON.stringify(body) },
        token,
      );
      return data.deck;
    } catch (error) {
      if (error instanceof ApiClientError && [404, 405].includes(error.status)) {
        throw new ApiClientError(
          error.status,
          "Deck update is not yet available on the backend. Changes saved locally.",
        );
      }
      throw error;
    }
  },

  async deleteDeck(id: string, token: string): Promise<void> {
    try {
      await request<void>(
        `/api/admin/decks/${id}`,
        { method: "DELETE" },
        token,
      );
    } catch (error) {
      if (error instanceof ApiClientError && [404, 405].includes(error.status)) {
        throw new ApiClientError(
          error.status,
          "Deck delete is not yet available on the backend. Removed locally.",
        );
      }
      throw error;
    }
  },

  async reorderDecks(
    orderedIds: string[],
    token: string,
  ): Promise<void> {
    try {
      await request<void>(
        "/api/admin/decks/reorder",
        { method: "PUT", body: JSON.stringify({ orderedIds }) },
        token,
      );
    } catch (error) {
      if (error instanceof ApiClientError && [404, 405].includes(error.status)) {
        return;
      }
      throw error;
    }
  },

  async listAdminFlashcards(deckId: string, token: string): Promise<Flashcard[]> {
    const data = await request<FlashcardListResponse>(
      `/api/admin/decks/${deckId}/flashcards`,
      {},
      token,
    );
    return data.flashcards;
  },

  publishFlashcards(deckId: string, flashcardIds: string[], token: string) {
    const body: UpdateFlashcardsStatusBody = { flashcardIds };
    return request<FlashcardListResponse>(
      `/api/admin/decks/${deckId}/flashcards/publish`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
  },

  draftFlashcards(deckId: string, flashcardIds: string[], token: string) {
    const body: UpdateFlashcardsStatusBody = { flashcardIds };
    return request<FlashcardListResponse>(
      `/api/admin/decks/${deckId}/flashcards/draft`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
  },

  async updateFlashcard(
    id: string,
    body: Partial<CreateFlashcardBody>,
    token: string,
  ): Promise<Flashcard> {
    try {
      const data = await request<FlashcardResponse>(
        `/api/admin/flashcards/${id}`,
        { method: "PUT", body: JSON.stringify(body) },
        token,
      );
      return data.flashcard;
    } catch (error) {
      if (error instanceof ApiClientError && [404, 405].includes(error.status)) {
        throw new ApiClientError(
          error.status,
          "Flashcard update is not yet available on the backend. Changes saved locally.",
        );
      }
      throw error;
    }
  },

  async deleteFlashcard(id: string, token: string): Promise<void> {
    try {
      await request<void>(
        `/api/admin/flashcards/${id}`,
        { method: "DELETE" },
        token,
      );
    } catch (error) {
      if (error instanceof ApiClientError && [404, 405].includes(error.status)) {
        throw new ApiClientError(
          error.status,
          "Flashcard delete is not yet available on the backend. Removed locally.",
        );
      }
      throw error;
    }
  },
};

export { ApiClientError };
