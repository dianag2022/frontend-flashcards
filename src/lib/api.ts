import { API_BASE_URL } from "./constants";
import { refreshAuthToken } from "./auth-token";
import { isAuthTokenError } from "./session";
import type {
  ApiError,
  CreateDeckBody,
  CreateCategoryBody,
  CreateFlashcardBody,
  Category,
  CategoryListResponse,
  CategoryResponse,
  Deck,
  DeckListResponse,
  DeckResponse,
  DraftDeckResponse,
  DeleteDeckResponse,
  DeleteFlashcardResponse,
  Flashcard,
  FlashcardListResponse,
  FlashcardResponse,
  ContentStatus,
  SignInBody,
  SignInResponse,
  SignUpBody,
  AdminSetupBody,
  UpdateFlashcardsStatusBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  MessageResponse,
  RefreshTokenBody,
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
  retried = false,
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
    const message = await parseError(response);

    if (
      response.status === 401 &&
      token &&
      !retried &&
      isAuthTokenError(message)
    ) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        return request<T>(path, options, newToken, true);
      }
      throw new ApiClientError(
        401,
        "No se pudo renovar la sesión. Espera un momento e intenta de nuevo.",
      );
    }

    throw new ApiClientError(response.status, message);
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

  refreshToken(body: RefreshTokenBody) {
    return request<SignInResponse>("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(body),
    });
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

  listPublishedCategories(deckId: string) {
    return request<CategoryListResponse>(`/api/decks/${deckId}/categories`);
  },

  listPublishedFlashcardsByCategory(deckId: string, categoryId: string) {
    return request<FlashcardListResponse>(
      `/api/decks/${deckId}/categories/${categoryId}/flashcards`,
    );
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

  listAdminCategories(deckId: string, token: string) {
    return request<CategoryListResponse>(
      `/api/admin/decks/${deckId}/categories`,
      {},
      token,
    );
  },

  createCategory(deckId: string, body: CreateCategoryBody, token: string) {
    return request<CategoryResponse>(
      `/api/admin/decks/${deckId}/categories`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  async listAdminDecks(token: string, status?: ContentStatus): Promise<Deck[]> {
    const query = status ? `?status=${status}` : "";
    const data = await request<DeckListResponse>(
      `/api/admin/decks${query}`,
      {},
      token,
    );
    return data.decks;
  },

  async getAdminDeck(id: string, token: string): Promise<Deck> {
    const decks = await api.listAdminDecks(token);
    const deck = decks.find((d) => d.id === id);
    if (!deck) {
      throw new ApiClientError(404, "Deck no encontrado.");
    }
    return deck;
  },

  async getAdminFlashcard(
    deckId: string,
    cardId: string,
    token: string,
  ): Promise<Flashcard> {
    const flashcards = await api.listAdminFlashcards(deckId, token);
    const card = flashcards.find((c) => c.id === cardId);
    if (!card) {
      throw new ApiClientError(404, "Tarjeta no encontrada.");
    }
    return card;
  },

  async updateDeck(
    id: string,
    body: Partial<CreateDeckBody>,
    token: string,
  ): Promise<Deck> {
    const data = await request<DeckResponse>(
      `/api/admin/decks/${id}`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
    return data.deck;
  },

  deleteDeck(id: string, token: string) {
    return request<DeleteDeckResponse>(
      `/api/admin/decks/${id}`,
      { method: "DELETE" },
      token,
    );
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
    const data = await request<FlashcardResponse>(
      `/api/admin/flashcards/${id}`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
    return data.flashcard;
  },

  deleteFlashcard(id: string, token: string) {
    return request<DeleteFlashcardResponse>(
      `/api/admin/flashcards/${id}`,
      { method: "DELETE" },
      token,
    );
  },
};

export { ApiClientError };
