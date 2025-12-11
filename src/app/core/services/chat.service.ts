import { HttpClient } from "@angular/common/http";
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
   * Kết nối WebSocket
   */
  connect(userId: string): void {
    // 1. Kiểm tra nếu đã kết nối rồi thì không kết nối lại
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket đã có sẵn, không cần kết nối lại.');
        return;
    }

    // 2. Nếu đang có kết nối dở dang hoặc đóng, reset lại
    if (this.websocket) {
        this.websocket.close();
    }
    const wsUrl = `${environment.wsUrl}/web-socket/chat?userId=${userId}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('✅ WebSocket Connected');
        this.connectionStatus.next(true);
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          console.log('📩 Received message:', message);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        this.connectionStatus.next(false);
      };

      // this.websocket.onclose = (event) => {
      //   console.log('🔌 WebSocket Disconnected');
      //   this.connectionStatus.next(false);
      //   this.websocket = null; // Reset biến
        
      //  if (event.code !== 1000) { 
      //        console.log('🔄 Reconnecting in 5 seconds...');
      //        setTimeout(() => this.connect(userId), 5000);
      //   }
      // };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
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
      console.log('🔌 WebSocket Disconnected Manually');
    }
  }

  /**
   * 1. Gửi tin nhắn
   * POST /api/v1/web-socket/send
   */
  sendMessage(message: ChatMessage): Observable<ApiResponse<ChatMessage>> {
    console.log('📤 Sending message:', message);
    return this.http.post<ApiResponse<ChatMessage>>(
      `${environment.apiUrl}/web-socket/send`,
      message
    );
  }

  /**
   * 2. Lấy lịch sử chat
   * GET /api/v1/web-socket/history?userId1=xxx&userId2=yyy
   */
  getChatHistory(userId1: string, userId2: string): Observable<ApiResponse<ChatMessage[]>> {
    console.log(`📜 Loading chat history: ${userId1} ↔️ ${userId2}`);
    return this.http.get<ApiResponse<ChatMessage[]>>(
      `${environment.apiUrl}/web-socket/history?userId1=${userId1}&userId2=${userId2}`
    );
  }

  /**
   * 3. Lấy danh sách cuộc hội thoại
   * GET /api/v1/web-socket/conversations?userId=xxx
   */
  getConversations(userId: string): Observable<ApiResponse<Conversation[]>> {
    console.log(`📋 Loading conversations for user: ${userId}`);
    return this.http.get<ApiResponse<Conversation[]>>(
      `${environment.apiUrl}/web-socket/conversations?userId=${userId}`
    );
  }

  /**
   * 4. Đánh dấu đã đọc
   * POST /api/v1/web-socket/mark-read?userId=xxx&fromUserId=yyy
   */
  markAsRead(userId: string, fromUserId: string): Observable<ApiResponse<void>> {
    console.log(`✅ Marking messages as read: ${userId} ← ${fromUserId}`);
    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/web-socket/mark-read?userId=${userId}&fromUserId=${fromUserId}`,
      {}
    );
  }

  /**
   * 5. Đếm tin nhắn chưa đọc
   * GET /api/v1/web-socket/unread-count?userId=xxx
   */
  getUnreadCount(userId: string): Observable<ApiResponse<number>> {
    console.log(`🔢 Getting unread count for user: ${userId}`);
    return this.http.get<ApiResponse<number>>(
      `${environment.apiUrl}/web-socket/unread-count?userId=${userId}`
    );
  }
};