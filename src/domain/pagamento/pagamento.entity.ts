import { PaymentStatus } from './pagamento.types';

export class Pagamento {
  private _id: string;
  private _pedido_id: string;
  private _cliente_id: string;
  private _status: PaymentStatus;
  private _valor: number;
  private _created_at: Date;
  private _updated_at: Date;

  constructor(data: Partial<Pagamento>) {
    if (data.id) this._id = data.id;
    if (data.pedido_id) this._pedido_id = data.pedido_id;
    if (data.cliente_id) this._cliente_id = data.cliente_id;
    if (data.status) this._status = data.status;
    if (data.valor) this._valor = data.valor;
    if (data.created_at) this._created_at = data.created_at;
    if (data.updated_at) this._updated_at = data.updated_at;
  }

  get id(): string {
    return this._id;
  }

  get pedido_id(): string {
    return this._pedido_id;
  }

  get cliente_id(): string {
    return this._cliente_id;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get valor(): number {
    return this._valor;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  set id(id: string) {
    this._id = id;
  }

  set pedido_id(pedido_id: string) {
    this._pedido_id = pedido_id;
  }

  set cliente_id(cliente_id: string) {
    this._cliente_id = cliente_id;
  }

  set status(status: PaymentStatus) {
    this._status = status;
  }

  set valor(valor: number) {
    this._valor = valor;
  }

  set created_at(created_at: Date) {
    this._created_at = created_at;
  }

  set updated_at(updated_at: Date) {
    this._updated_at = updated_at;
  }

  public isPaymentApproved(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }

  public updateStatus(status: PaymentStatus): void {
    this.status = status;
    this.updated_at = new Date();
  }
}
