import { User } from '@/interfaces/UserInterface';

export interface SSOData {
  token: string;
  user: User;
  expiresAt: number;
}

class SSOService {
  private static instance: SSOService;
  private listeners: Array<(ssoData: SSOData | null) => void> = [];
  private postMessageListenerSetup = false;

  private constructor() {
    // Listen for storage changes across tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  public static getInstance(): SSOService {
    if (!SSOService.instance) {
      SSOService.instance = new SSOService();
    }
    return SSOService.instance;
  }

  /**
   * Initialize SSO - check localStorage and setup postMessage
   */
  public async initialize(): Promise<SSOData | null> {
    console.log('🔐 Initializing SSO Service...');

    // First, try to get SSO data from localStorage
    let ssoData = this.getSSODataFromStorage();
    
    if (ssoData) {
      console.log('✅ Found SSO data in localStorage');
      this.storeSSODataInMemory(ssoData);
      return ssoData;
    }

    // If no localStorage data, try to request from parent window via postMessage
    console.log('📡 Requesting SSO data from host via postMessage...');
    ssoData = await this.requestSSODataFromHost();
    
    if (ssoData) {
      console.log('✅ Received SSO data from host');
      this.storeSSOData(ssoData.token, ssoData.user, Math.floor((ssoData.expiresAt - Date.now()) / 1000));
      return ssoData;
    }

    console.log('❌ No SSO data available - user needs to authenticate');
    return null;
  }

  /**
   * Store SSO data securely
   */
  public storeSSOData(token: string, user: User, expiresIn: number = 3600): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    const ssoData: SSOData = {
      token,
      user,
      expiresAt
    };

    // Store in sessionStorage (more secure than localStorage)
    sessionStorage.setItem('sso_data', JSON.stringify(ssoData));
    
    // Also store basic info in localStorage for cross-tab communication
    localStorage.setItem('sso_token', token);
    localStorage.setItem('sso_user', JSON.stringify(user));
    localStorage.setItem('sso_expires_at', expiresAt.toString());

    // Store legacy auth data for compatibility
    localStorage.setItem('authToken', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }

    // Notify all listeners
    this.notifyListeners(ssoData);
  }

  /**
   * Store SSO data in memory only (from external source)
   */
  private storeSSODataInMemory(ssoData: SSOData): void {
    // Store in sessionStorage
    sessionStorage.setItem('sso_data', JSON.stringify(ssoData));

    // Store legacy auth data for compatibility
    localStorage.setItem('authToken', ssoData.token);
    localStorage.setItem('auth_user', JSON.stringify(ssoData.user));
    if (ssoData.user?.id) {
      localStorage.setItem('userId', ssoData.user.id);
    }

    this.notifyListeners(ssoData);
  }

  /**
   * Get current SSO data
   */
  public getSSOData(): SSOData | null {
    try {
      const ssoDataStr = sessionStorage.getItem('sso_data');
      if (!ssoDataStr) {
        // Fallback to localStorage
        return this.getSSODataFromStorage();
      }

      const ssoData: SSOData = JSON.parse(ssoDataStr);
      
      // Check if token is expired
      if (Date.now() >= ssoData.expiresAt) {
        this.clearSSOData();
        return null;
      }

      return ssoData;
    } catch (error) {
      console.error('Error getting SSO data:', error);
      return null;
    }
  }

  private getSSODataFromStorage(): SSOData | null {
    try {
      const token = localStorage.getItem('sso_token');
      const userStr = localStorage.getItem('sso_user');
      const expiresAtStr = localStorage.getItem('sso_expires_at');

      if (!token || !userStr || !expiresAtStr) {
        return null;
      }

      const expiresAt = parseInt(expiresAtStr);
      if (Date.now() >= expiresAt) {
        this.clearSSOData();
        return null;
      }

      return {
        token,
        user: JSON.parse(userStr),
        expiresAt
      };
    } catch (error) {
      console.error('Error getting SSO data from localStorage:', error);
      return null;
    }
  }

  /**
   * Request SSO data from host window via postMessage
   */
  private async requestSSODataFromHost(): Promise<SSOData | null> {
    return new Promise((resolve) => {
      if (!window.opener) {
        console.log('No opener window available for postMessage');
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.log('⏰ Timeout waiting for SSO data from host');
        resolve(null);
      }, 5000); // 5 second timeout

      const messageHandler = (event: MessageEvent) => {
        // In production, verify origin more strictly
        if (event.data.type === 'SSO_DATA_RESPONSE') {
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          
          const ssoData = event.data.payload as SSOData;
          if (ssoData && ssoData.token && ssoData.user) {
            resolve(ssoData);
          } else {
            resolve(null);
          }
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Request SSO data from host
      window.opener.postMessage({
        type: 'REQUEST_SSO_DATA'
      }, '*');
    });
  }

  /**
   * Setup postMessage listener for ongoing communication
   */
  public setupPostMessageListener(): void {
    if (this.postMessageListenerSetup) return;

    window.addEventListener('message', (event) => {
      if (event.data.type === 'SSO_DATA_UPDATE') {
        const ssoData = event.data.payload as SSOData;
        if (ssoData) {
          this.storeSSODataInMemory(ssoData);
        }
      }
    });

    this.postMessageListenerSetup = true;
  }

  /**
   * Clear SSO data (logout)
   */
  public clearSSOData(): void {
    sessionStorage.removeItem('sso_data');
    localStorage.removeItem('sso_token');
    localStorage.removeItem('sso_user');
    localStorage.removeItem('sso_expires_at');

    // Clear legacy auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('userId');

    this.notifyListeners(null);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const ssoData = this.getSSOData();
    return ssoData !== null;
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    const ssoData = this.getSSOData();
    return ssoData?.user || null;
  }

  /**
   * Get current token
   */
  public getCurrentToken(): string | null {
    const ssoData = this.getSSOData();
    return ssoData?.token || null;
  }

  /**
   * Subscribe to SSO data changes
   */
  public subscribe(callback: (ssoData: SSOData | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Handle storage changes (cross-tab synchronization)
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'sso_token' || event.key === 'sso_user' || event.key === 'sso_expires_at') {
      const ssoData = this.getSSOData();
      this.notifyListeners(ssoData);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(ssoData: SSOData | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(ssoData);
      } catch (error) {
        console.error('Error in SSO listener:', error);
      }
    });
  }
}

export const ssoService = SSOService.getInstance();