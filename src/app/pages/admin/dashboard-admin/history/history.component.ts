import { Component, OnInit } from '@angular/core';
import { TaskHistoryItem, TaskHistoryRequest, TaskHistoryService } from '../../../../core/services/task-history.service';

@Component({
  selector: 'app-history',
  standalone: false,
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  taskTypes: string[] = [];
  taskHistories: TaskHistoryItem[] = [];
  page = 0;
  size = 10;
  totalItems = 0;
  totalPages = 0;


  constructor(private taskHistoryService: TaskHistoryService) { }

  ngOnInit(): void {
    this.loadTaskTypes();
    this.loadHistories();
  }

  loadTaskTypes(): void {
    this.taskHistoryService.getTaskList().subscribe({
      next: (response) => {
        this.taskTypes = response.data.map(item => item.task);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách task vụ:', err);
      }
    });
  }

  filter: TaskHistoryRequest = {
    startDate: '2025-07-01',
    endDate: '2025-07-30',
    task: null
  };

  loadHistories(): void {
    this.taskHistoryService.getAllHistories(this.filter, this.page, this.size).subscribe({
      next: (res) => {
        this.taskHistories = res.data.content;
        this.totalItems = res.data.currentTotalElementsCount;
        this.totalPages = res.data.pagesCount;

         this.filter = {
          startDate: '2025-07-01', // Reset về giá trị mặc định ban đầu
          endDate: '2025-07-30',   // Reset về giá trị mặc định ban đầu
          task: null,
          content: '',
          createdBy: ''
        };
      },
      error: (err) => {
        console.error('Lỗi khi tải lịch sử tác vụ:', err);
      }
    });
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadHistories();
    }
  }

  nextPage(): void {
    if ((this.page + 1) < this.totalPages) {
      this.page++;
      this.loadHistories();
    }
  }


  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  onSearch(): void {
    this.page = 0; // reset về trang đầu
    this.loadHistories();
  }
}
