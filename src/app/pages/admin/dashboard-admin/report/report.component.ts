import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto'; // Import Chart.js
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import datalabels plugin

// Đăng ký plugin nếu bạn muốn sử dụng datalabels trên tất cả các biểu đồ
// Hoặc bạn có thể đăng ký cục bộ cho từng biểu đồ
Chart.register(ChartDataLabels);

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'] // Hoặc './report.component.css' nếu không dùng SCSS
})
export class ReportComponent implements OnInit, AfterViewInit {

   startDate: string = '2025-07-11';
  endDate: string = '2025-07-27';
  selectedChannel: string = '';

  constructor() { }

  ngOnInit(): void {
    // Logic khởi tạo dữ liệu ban đầu nếu cần
  }

  ngAfterViewInit(): void {
    // Khởi tạo các biểu đồ sau khi view đã được render
    this.initCharts();
  }
  onSearch(): void {
    // Lấy giá trị từ các input HTML
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    const channelSelect = document.getElementById('channel') as HTMLSelectElement;

    this.startDate = startDateInput.value;
    this.endDate = endDateInput.value;
    this.selectedChannel = channelSelect.value;

    console.log('Tìm kiếm từ ngày:', this.startDate);
    console.log('Đến ngày:', this.endDate);
    console.log('Kênh đã chọn:', this.selectedChannel);

    // Ở đây bạn có thể gọi API để lấy dữ liệu mới cho dashboard
    // và cập nhật các biểu đồ/thông số tóm tắt
    // Ví dụ: this.fetchNewDashboardData(this.startDate, this.endDate, this.selectedChannel);
  }

  

  initCharts(): void {
    
    // Data giả định
    const inventoryRatioData = {
        labels: ['Bán một phần'],
        datasets: [{
            data: [100],
            backgroundColor: ['#00bcd4'],
            hoverOffset: 4,
            borderWidth: 0,
        }]
    };

    const inventoryByChannelData = {
        labels: ['Kênh VTV 3', 'Kênh VTV 2', 'Kênh VTV 4', 'Kênh VTV 5', 'Kênh VTV 7'],
        datasets: [{
            data: [1, 0, 0, 1, 0],
            backgroundColor: '#667eea',
            barPercentage: 0.5,
            categoryPercentage: 0.6,
            borderRadius: 5,
        }]
    };

    const revenueByChannelData = {
        labels: ['VTV1', 'VTV2', 'VTV3', 'VTV4', 'VTV5', 'VTV6'],
        datasets: [{
            data: [1000, 750, 900, 600, 2500, 400],
            backgroundColor: '#667eea',
            barPercentage: 0.7,
            categoryPercentage: 0.8,
            borderRadius: 5,
        }]
    };

    const fillRateData = {
        labels: Array.from({length: 24}, (_, i) => `${i}`),
        datasets: [{
            data: [0, 0, 15, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 10, 0, 0],
            borderColor: '#667eea',
            backgroundColor: '#667eea',
            pointRadius: 4,
            pointBackgroundColor: '#667eea',
            fill: false,
            tension: 0.1,
        }]
    };

    const revenueByTimeData = {
        labels: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
        datasets: [{
            data: [800, 1150, 900, 1100, 1250, 2200, 1800],
            backgroundColor: '#667eea',
            barPercentage: 0.7,
            categoryPercentage: 0.8,
            borderRadius: 5,
        }]
    };

    // Cấu hình options chung cho các biểu đồ
    const options: any = { // Sử dụng 'any' để tránh lỗi kiểu nếu cấu hình quá phức tạp
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: { display: false }, // Vẫn để false nếu không muốn hiển thị mặc định
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#777' }
            },
            y: {
                grid: { color: '#eee', drawBorder: false },
                ticks: {
                    callback: function(value: number) {
                        return value > 0 ? value : '';
                    },
                    color: '#777'
                },
                min: 0,
                beginAtZero: true
            }
        }
    };

    // Khởi tạo các biểu đồ
    new Chart('inventory-ratio-chart', {
        type: 'doughnut',
        data: inventoryRatioData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: { display: false }
            },
            cutout: '70%'
        }
    });

    new Chart('inventory-by-channel-chart', {
        type: 'bar',
        data: inventoryByChannelData,
        options: {
            ...options,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#777', font: { size: 10 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { display: false }
                }
            }
        }
    });

    new Chart('revenue-by-channel-chart', {
        type: 'bar',
        data: revenueByChannelData,
        options: {
            ...options,
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#777' }
                },
                y: {
                    grid: { color: '#eee', drawBorder: false },
                    ticks: {
                         callback: function(value: number) {
                            if (value % 650 === 0) { // Điều chỉnh bước nhảy cho giống hình ảnh
                                return value;
                            }
                            return '';
                        },
                         color: '#777'
                    },
                    min: 0,
                    max: 2600, // Đặt max cố định nếu cần
                    beginAtZero: true
                }
            }
        }
    });

    new Chart('fill-rate-chart', {
        type: 'line',
        data: fillRateData,
        options: {
            ...options,
            scales: {
                x: {
                    grid: { color: '#eee', drawBorder: false },
                    ticks: {
                        callback: function(value: number, index: number) {
                            // TypeScript context requires 'this' to be handled carefully
                            // Use direct array access or remove 'this' depending on Chart.js version and setup
                            const label = fillRateData.labels[value as number]; // Cast to number
                            return index % 2 === 0 ? label : '';
                        },
                        color: '#777',
                        autoSkip: false
                    }
                },
                y: {
                    grid: { color: '#eee', drawBorder: false },
                    ticks: {
                        callback: function(value: number) {
                            if (value % 25 === 0) {
                                return value;
                            }
                            return '';
                        },
                        color: '#777'
                    },
                    min: 0,
                    max: 100,
                    beginAtZero: true
                }
            }
        }
    });

    new Chart('revenue-by-time-chart', {
        type: 'bar',
        data: revenueByTimeData,
        options: {
            ...options,
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#777' }
                },
                y: {
                    grid: { color: '#eee', drawBorder: false },
                    ticks: {
                         callback: function(value: number) {
                            if (value % 550 === 0) { // Điều chỉnh bước nhảy cho giống hình ảnh
                                return value;
                            }
                            return '';
                        },
                         color: '#777'
                    },
                    min: 0,
                    max: 2200,
                    beginAtZero: true
                }
            }
        }
    });
  }
}