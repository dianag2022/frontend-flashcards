import { API_BASE_URL } from "./constants";
import { refreshAuthToken } from "./auth-token";
import { isAuthTokenError } from "./session";
import {
  sortCategoriesNewestFirst,
  sortDecksByOrder,
  sortFlashcardsNewestFirst,
} from "./content-order";
import type {
  ApiError,
  CreateDeckBody,
  UpdateDeckBody,
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateFlashcardBody,
  UpdateFlashcardBody,
  UploadImageResponse,
  GlossaryTerm,
  GlossaryListResponse,
  GlossaryTermResponse,
  CreateGlossaryTermBody,
  SendNotificationBody,
  SendNotificationResponse,
  Category,
  CategoryListResponse,
  CategoryResponse,
  CategoryStatusResponse,
  Deck,
  DeckListResponse,
  DeckResponse,
  DraftDeckResponse,
  DeleteDeckResponse,
  DeleteCategoryResponse,
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

async function uploadFile(
  path: string,
  file: File,
  token: string,
  retried = false,
): Promise<UploadImageResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const message = await parseError(response);
    if (response.status === 401 && !retried && isAuthTokenError(message)) {
      const newToken = await refreshAuthToken();
      if (newToken) return uploadFile(path, file, newToken, true);
    }
    throw new ApiClientError(response.status, message);
  }

  const data = (await response.json()) as UploadImageResponse & {
    fileUrl?: string;
    downloadUrl?: string;
  };
  const url = data.url || data.imageUrl || data.fileUrl || data.downloadUrl;
  if (!url) {
    throw new ApiClientError(500, "El servidor no devolvió la URL de la imagen.");
  }
  return { url, imageUrl: data.imageUrl ?? url };
}

function normalizeGlossaryList(
  data: GlossaryListResponse & { glossary?: GlossaryTerm[] },
): GlossaryListResponse {
  return { terms: data.terms ?? data.glossary ?? [] };
}

function normalizeGlossaryTerm(
  data: GlossaryTermResponse & Partial<GlossaryTerm>,
): GlossaryTermResponse {
  if (data.term?.id) return { term: data.term };
  return { term: data as GlossaryTerm };
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

  async listPublishedDecks() {
    const data = await request<DeckListResponse>("/api/decks");
    return { decks: sortDecksByOrder(data.decks) };
  },

  async listPublishedFlashcards(deckId: string) {
    const data = await request<FlashcardListResponse>(
      `/api/decks/${deckId}/flashcards`,
    );
    return { flashcards: sortFlashcardsNewestFirst(data.flashcards) };
  },

  async listPublishedCategories(deckId: string) {
    const data = await request<CategoryListResponse>(
      `/api/decks/${deckId}/categories`,
    );
    return { categories: sortCategoriesNewestFirst(data.categories) };
  },

  async listPublishedFlashcardsByCategory(deckId: string, categoryId: string) {
    const data = await request<FlashcardListResponse>(
      `/api/decks/${deckId}/categories/${categoryId}/flashcards`,
    );
    return { flashcards: sortFlashcardsNewestFirst(data.flashcards) };
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

  async listAdminCategories(deckId: string, token: string) {
    const data = await request<CategoryListResponse>(
      `/api/admin/decks/${deckId}/categories`,
      {},
      token,
    );
    return { categories: sortCategoriesNewestFirst(data.categories) };
  },

  createCategory(deckId: string, body: CreateCategoryBody, token: string) {
    return request<CategoryResponse>(
      `/api/admin/decks/${deckId}/categories`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  async updateCategory(
    deckId: string,
    categoryId: string,
    body: UpdateCategoryBody,
    token: string,
  ): Promise<Category> {
    const data = await request<CategoryResponse>(
      `/api/admin/decks/${deckId}/categories/${categoryId}`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
    return data.category;
  },

  deleteCategory(deckId: string, categoryId: string, token: string) {
    return request<DeleteCategoryResponse>(
      `/api/admin/decks/${deckId}/categories/${categoryId}`,
      { method: "DELETE" },
      token,
    );
  },

  publishCategory(deckId: string, categoryId: string, token: string) {
    return request<CategoryStatusResponse>(
      `/api/admin/decks/${deckId}/categories/${categoryId}/publish`,
      { method: "PUT" },
      token,
    );
  },

  draftCategory(deckId: string, categoryId: string, token: string) {
    return request<CategoryStatusResponse>(
      `/api/admin/decks/${deckId}/categories/${categoryId}/draft`,
      { method: "PUT" },
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
    return sortDecksByOrder(data.decks);
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
    body: UpdateDeckBody,
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

  reorderDecks(orderedIds: string[], token: string) {
    return request<void>(
      "/api/admin/decks/reorder",
      { method: "PUT", body: JSON.stringify({ orderedIds }) },
      token,
    );
  },

  async listAdminFlashcards(deckId: string, token: string): Promise<Flashcard[]> {
    const data = await request<FlashcardListResponse>(
      `/api/admin/decks/${deckId}/flashcards`,
      {},
      token,
    );
    return sortFlashcardsNewestFirst(data.flashcards);
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

  uploadImage(file: File, token: string) {
    return uploadFile("/api/admin/uploads", file, token);
  },

  async updateFlashcard(
    id: string,
    body: UpdateFlashcardBody,
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

  async listGlossary(token?: string | null) {
    const data = await request<GlossaryListResponse>("/api/glossary", {}, token);
    return normalizeGlossaryList(data);
  },

  async listAdminGlossary(token: string) {
    const data = await request<GlossaryListResponse>(
      "/api/admin/glossary",
      {},
      token,
    );
    return normalizeGlossaryList(data);
  },

  async createGlossaryTerm(body: CreateGlossaryTermBody, token: string) {
    const data = await request<GlossaryTermResponse>(
      "/api/admin/glossary",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
    return normalizeGlossaryTerm(data);
  },

  async updateGlossaryTerm(id: string, body: CreateGlossaryTermBody, token: string) {
    const data = await request<GlossaryTermResponse>(
      `/api/admin/glossary/${id}`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
    return normalizeGlossaryTerm(data);
  },

  deleteGlossaryTerm(id: string, token: string) {
    return request<{ message: string; id: string }>(
      `/api/admin/glossary/${id}`,
      { method: "DELETE" },
      token,
    );
  },

  sendNotification(body: SendNotificationBody, token: string) {
    return request<SendNotificationResponse>(
      "/api/admin/notifications",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },
};

export { ApiClientError };
