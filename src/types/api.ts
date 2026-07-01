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

export interface Category {
  id: string;
  deckId: string;
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
  categoryId: string;
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

export interface CreateCategoryBody {
  title: string;
  description: string;
}

export interface CreateFlashcardBody {
  deckId: string;
  categoryId: string;
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

export interface RefreshTokenBody {
  refreshToken: string;
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

export interface DraftDeckResponse {
  deck: Deck;
  categoriesDrafted: number;
  flashcardsDrafted: number;
}

export interface DeleteDeckResponse {
  message: string;
  deckId: string;
  categoriesDeleted: number;
  flashcardsDeleted: number;
}

export interface CategoryListResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}

export interface DeleteFlashcardResponse {
  message: string;
  flashcardId: string;
}

export interface FlashcardListResponse {
  flashcards: Flashcard[];
}

export interface FlashcardResponse {
  flashcard: Flashcard;
}

export interface MessageResponse {
  message: string;
  email?: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  oobCode: string;
  newPassword: string;
}

export interface UpdateFlashcardsStatusBody {
  flashcardIds: string[];
}

export interface UpdateCategoriesStatusBody {
  categoryIds: string[];
}
