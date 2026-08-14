export class ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}
