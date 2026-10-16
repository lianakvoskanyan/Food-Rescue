export class SellerServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SellerServiceError";
  }
}
