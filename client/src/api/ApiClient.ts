import type {
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    SessionResponse,
    UpdateSessionRequest,
    EndSessionRequest,
    LeaderboardResponse
} from '@shared/types/api';

export class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    getToken(): string | null {
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // ============ AUTENTICAÇÃO ============
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout(): Promise<void> {
        await this.request('/api/auth/logout', {
            method: 'POST',
        });
        this.clearToken();
    }

    // ============ SESSÕES ============
    async createSession(): Promise<SessionResponse> {
        return this.request<SessionResponse>('/api/sessions', {
            method: 'POST',
        });
    }

    async updateSession(
        sessionId: string,
        data: UpdateSessionRequest
    ): Promise<SessionResponse> {
        return this.request<SessionResponse>(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async endSession(
        sessionId: string,
        data: EndSessionRequest
    ): Promise<SessionResponse & { leaderboardPosition?: number }> {
        return this.request<SessionResponse & { leaderboardPosition?: number }>(
            `/api/sessions/${sessionId}/end`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    // ============ LEADERBOARD ============
    async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
        return this.request<LeaderboardResponse>(`/api/leaderboard?limit=${limit}`);
    }
}
