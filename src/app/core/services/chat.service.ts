import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/enviroment";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Injectable } from "@angular/core";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName?: string;
  receiverAvatar?: string;
  content: string;
  messageType: number;
  isRead?: boolean;
  fileUrl?: string;
  createdDate?: Date;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  unreadCount: number;
  lastMessageTime: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private websocket: WebSocket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  
  public message$ = this.messageSubject.asObservable();
  public isConnected$ = this.connectionStatus.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Kết nối WebSocket (Native WebSocket cho WebFlux)
   */
  connect(userId: string): void {
    // WebSocket URL cho WebFlux
    const wsUrl = `${environment}/web-socker/chat?userId=${userId}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket Connected');
        this.connectionStatus.next(true);
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.connectionStatus.next(false);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket Disconnected');
        this.connectionStatus.next(false);
        
        // Thử kết nối lại sau 5 giây
        setTimeout(() => this.connect(userId), 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatus.next(false);
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.connectionStatus.next(false);
      console.log('WebSocket Disconnected');
    }
  }

  /**
   * Gửi tin nhắn qua HTTP (vì WebFlux không dùng STOMP)
   */
  sendMessage(message: ChatMessage): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(
      `${environment.apiUrl}/web-socket/send`,
      message
    );
  }

  /**
   * Lấy lịch sử chat
   */
  getChatHistory(userId1: string, userId2: string): Observable<ApiResponse<ChatMessage[]>> {
    return this.http.get<ApiResponse<ChatMessage[]>>(
      `${environment.apiUrl}/web-socket/history?userId1=${userId1}&userId2=${userId2}`
    );
  }

  /**
   * Lấy danh sách cuộc hội thoại
   */
  getConversations(userId: string): Observable<ApiResponse<Conversation[]>> {
    const headers = new HttpHeaders().set('userId', userId);
    return this.http.get<ApiResponse<Conversation[]>>(
      `${environment.apiUrl}/web-socket/conversations`,
      { headers }
    );
  }

  /**
   * Đánh dấu đã đọc
   */
  markAsRead(userId: string, fromUserId: string): Observable<ApiResponse<void>> {
    const headers = new HttpHeaders().set('userId', userId);
    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/web-socket/mark-read?fromUserId=${fromUserId}`,
      {},
      { headers }
    );
  }

  /**
   * Đếm tin nhắn chưa đọc
   */
  getUnreadCount(userId: string): Observable<ApiResponse<number>> {
    const headers = new HttpHeaders().set('userId', userId);
    return this.http.get<ApiResponse<number>>(
      `${environment.apiUrl}/web-socket/unread-count`,
      { headers }
    );
  }
}