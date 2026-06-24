export type ContentStatus = "draft" | "published";

export interface Deck {
  id: string;
  title: string;
  description: string;
  status: ContentStatus;
  cardCount: number;
  updatedAt: string;
  order?: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  status: ContentStatus;
  createdAt: string;
  order?: number;
}

export interface CreateDeckBody {
  title: string;
  description: string;
}

export interface CreateFlashcardBody {
  deckId: string;
  front: string;
  back: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export type SignUpBody = SignInBody;

export interface AdminSetupBody {
  email: string;
  password: string;
  setupSecret: string;
}

export interface SignInResponse {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  role: "admin" | "end-user" | null;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface DraftFlashcardPair {
  front: string;
  back: string;
  approved: boolean;
}

export interface DeckListResponse {
  decks: Deck[];
}

export interface DeckResponse {
  deck: Deck;
}

export interface FlashcardListResponse {
  flashcards: Flashcard[];
}

export interface FlashcardResponse {
  flashcard: Flashcard;
}

export interface UpdateFlashcardsStatusBody {
  flashcardIds: string[];
}
