import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService, ChatMessage, Conversation } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  currentUserId: string = '';
  currentUserName: string = '';
  currentUserAvatar: string = '';
  
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  
  isConnected: boolean = false;
  isLoading: boolean = false;
  isSending: boolean = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.connectWebSocket();
    this.subscribeToMessages();
    this.loadConversations();
    
    // Kiểm tra có receiverId từ query params không (từ store detail)
    this.checkAutoSelectConversation();
  }

  ngOnDestroy(): void {
    // this.chatService.disconnect();
    console.log('Rời màn hình chat, nhưng vẫn giữ kết nối ngầm.');
  }

  loadCurrentUser(): void {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        const data = typeof profile.data === 'string' 
          ? JSON.parse(profile.data) 
          : profile.data;
        
        this.currentUserId = data.userId;
        this.currentUserName = data.fullName || data.username;
        this.currentUserAvatar = data.avatar;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  /**
   * Tự động chọn conversation nếu có receiverId từ query params
   */
  checkAutoSelectConversation(): void {
    this.route.queryParams.subscribe(params => {
      const receiverId = params['receiverId'];
      const receiverName = params['receiverName'];
      
      if (receiverId) {
        // Tìm conversation với receiverId
        const existingConv = this.conversations.find(c => c.userId === receiverId);
        
        if (existingConv) {
          // Nếu đã có conversation, chọn nó
          this.selectConversation(existingConv);
        } else {
          // Nếu chưa có, tạo conversation mới (dummy)
          const newConv: Conversation = {
            userId: receiverId,
            userName: receiverName || 'Người dùng',
            userAvatar: '',
            lastMessage: '',
            unreadCount: 0,
            lastMessageTime: new Date()
          };
          
          this.selectConversation(newConv);
        }
      }
    });
  }

  connectWebSocket(): void {
    this.chatService.connect(this.currentUserId);
    
    this.chatService.isConnected$.subscribe(status => {
      this.isConnected = status;
    });
  }

  subscribeToMessages(): void {
    this.chatService.message$.subscribe(message => {
      if (this.selectedConversation && 
          message.senderId === this.selectedConversation.userId) {
        this.messages.push(message);
        this.scrollToBottom();
        
        this.chatService.markAsRead(this.currentUserId, message.senderId).subscribe();
      }
      
      this.loadConversations();
    });
  }

  loadConversations(): void {
    this.chatService.getConversations(this.currentUserId).subscribe({
      next: (response) => {
        if (response.success) {
          this.conversations = response.data;
        }
      },
      error: (error) => console.error('Error loading conversations:', error)
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadChatHistory(conversation.userId);
    
    if (conversation.unreadCount > 0) {
      this.chatService.markAsRead(this.currentUserId, conversation.userId).subscribe({
        next: () => {
          conversation.unreadCount = 0;
        }
      });
    }
  }

  loadChatHistory(otherUserId: string): void {
    this.isLoading = true;
    debugger
    this.chatService.getChatHistory(this.currentUserId, otherUserId).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages = response.data;
          this.scrollToBottom();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) {
      return;
    }

    this.isSending = true;

    const message: ChatMessage = {
      senderId: this.currentUserId,
      receiverId: this.selectedConversation.userId,
      content: this.newMessage.trim(),
      messageType: 1
    };

    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push(response.data);
          this.newMessage = '';
          this.scrollToBottom();
          
          // Reload conversations để cập nhật lastMessage
          this.loadConversations();
        }
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return messageDate.toLocaleDateString('vi-VN');
  }
}