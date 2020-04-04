abstract class StateMachine<State extends string, Action extends string> {
  private state: State

  protected constructor(initialState: State) {
    this.state = initialState
  }

  abstract getPossibleActionsForState(state: State): Action[];
  abstract getNextState(action: Action): State;

  getState(): State {
    return this.state;
  }

  getPossibleActions(): Action[] {
    return this.getPossibleActionsForState(this.getState())
  }

  act(action: Action) {
    if (this.getPossibleActions().indexOf(action) < 0) throw new Error('Illegal Action')
    this.state = this.getNextState(action)
  }
}

export type OrderState =
  'NOT_PLACED'
  | 'PLACED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FULFILLING'
  | 'DELIVERED'
  | 'PAID'
  | 'DONE'

export type OrderAction =
  'PLACE'
  | 'CANCEL'
  | 'EXPIRE'
  | 'ACCEPT'
  | 'UNACCEPT'
  | 'DELIVER'
  | 'PAY'
  | 'ACCEPT_PAYMENT'

export class Order extends StateMachine<OrderState, OrderAction> {
  getPossibleActionsForState(state: OrderState): OrderAction[] {
    switch (state) {
      case 'NOT_PLACED':
        return ['PLACE']
      case 'PLACED':
        return ['CANCEL', 'EXPIRE', 'ACCEPT']
      case 'CANCELLED':
        return []
      case 'EXPIRED':
        return []
      case 'FULFILLING':
        return ['DELIVER']
      case 'DELIVERED':
        return ['PAY']
      case 'PAID':
        return ['ACCEPT_PAYMENT']
      case 'DONE':
        return []
    }
  }

  getNextState(action: OrderAction): OrderState {
    switch (action) {
      case 'PLACE':
        return 'PLACED'
      case 'CANCEL':
        return 'CANCELLED'
      case 'EXPIRE':
        return 'EXPIRED'
      case 'ACCEPT':
        return 'FULFILLING'
      case 'UNACCEPT':
        return 'PLACED'
      case 'DELIVER':
        return 'DELIVERED'
      case 'PAY':
        return 'PAID'
      case 'ACCEPT_PAYMENT':
        return 'DONE'
    }
  }
}
