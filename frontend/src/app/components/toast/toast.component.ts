import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-center gap-3 min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md"
          [ngClass]="{
            'bg-emerald-900/90 border-emerald-500/50 text-emerald-100': toast.type === 'success',
            'bg-rose-900/90 border-rose-500/50 text-rose-100': toast.type === 'error',
            'bg-amber-900/90 border-amber-500/50 text-amber-100': toast.type === 'warning',
            'bg-indigo-900/90 border-indigo-500/50 text-indigo-100': toast.type === 'info'
          }"
        >
          <!-- Icons -->
          @if (toast.type === 'success') {
            <div class="flex-shrink-0 bg-emerald-500/20 p-2 rounded-full">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
          } @else if (toast.type === 'error') {
            <div class="flex-shrink-0 bg-rose-500/20 p-2 rounded-full">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          } @else if (toast.type === 'warning') {
            <div class="flex-shrink-0 bg-amber-500/20 p-2 rounded-full">
              <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          } @else {
            <div class="flex-shrink-0 bg-indigo-500/20 p-2 rounded-full">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          }

          <div class="flex-1 font-inter">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
