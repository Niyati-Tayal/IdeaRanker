import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-user' },
  })),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-idea-id' }),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

// Mock Gemini
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          budget_estimate: { min: 1000, max: 5000, currency: 'USD', notes: 'Based on SaaS averages' },
          time_required: { value: 6, unit: 'months', breakdown: 'Development and testing' },
          opportunities: ['Market gap', 'Low competition'],
          drawbacks: ['High churn potential'],
          pain_points: ['Slow manual processes'],
          why_good_for_you: 'Leverages your background',
          how_it_works: 'Automated workflow engine',
          scores: { feasibility: 8, marketPotential: 9, innovation: 7, effort: 4 }
        })
      })
    }
  })),
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    ARRAY: 'ARRAY'
  }
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));
