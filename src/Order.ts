abstract class StateMachine<State extends string, Action extends string> implements Readonly<StateMachine<State, Action>> {
  private readonly state: State

  constructor (state: State) {
    this.state = state
  }

  abstract getPossibleActionsForState (state: State): Action[];

  abstract getNextStateForAction (action: Action): State;

  abstract act (action: Action): StateMachine<State, Action>;

  getState (): State {
    return this.state
  }

  getPossibleActions (): Action[] {
    return this.getPossibleActionsForState(this.getState())
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
  | 'DISPUTED_DELIVERY'
  | 'DISPUTED_PAYMENT'

export type OrderAction =
  'PLACE'
  | 'CANCEL'
  | 'UNCANCEL'
  | 'EXPIRE'
  | 'ACCEPT'
  | 'UNACCEPT'
  | 'DELIVER'
  | 'UNDELIVER'
  | 'PAY'
  | 'DISPUTE_DELIVERY'
  | 'UNDISPUTE_DELIVERY'
  | 'ACCEPT_PAYMENT'
  | 'DISPUTE_PAYMENT'
  | 'UNDISPUTE_PAYMENT'
  | 'RESOLVE'

export type OrderTenant =
  'CUSTOMER'
  | 'DELIVERER'
  | 'MODERATOR'
  | 'SYSTEM'

export class OrderStateMachine extends StateMachine<OrderState, OrderAction> {
  getPossibleActionsForState (state: OrderState): OrderAction[] {
    switch (state) {
      case 'NOT_PLACED':
        return ['PLACE']
      case 'PLACED':
        return ['CANCEL', 'EXPIRE', 'ACCEPT']
      case 'CANCELLED':
        return ['UNCANCEL']
      case 'EXPIRED':
        return []
      case 'FULFILLING':
        return ['DELIVER', 'UNACCEPT']
      case 'DELIVERED':
        return ['PAY', 'UNDELIVER', 'DISPUTE_DELIVERY', 'DISPUTE_PAYMENT']
      case 'PAID':
        return ['ACCEPT_PAYMENT', 'DISPUTE_PAYMENT']
      case 'DISPUTED_DELIVERY':
        return ['UNDISPUTE_DELIVERY', 'RESOLVE']
      case 'DISPUTED_PAYMENT':
        return ['UNDISPUTE_PAYMENT', 'RESOLVE']
      case 'DONE':
        return []
    }
  }

  getNextStateForAction (action: OrderAction): OrderState {
    switch (action) {
      case 'PLACE':
        return 'PLACED'
      case 'CANCEL':
        return 'CANCELLED'
      case 'UNCANCEL':
        return 'PLACED'
      case 'EXPIRE':
        return 'EXPIRED'
      case 'ACCEPT':
        return 'FULFILLING'
      case 'UNACCEPT':
        return 'PLACED'
      case 'DELIVER':
        return 'DELIVERED'
      case 'UNDELIVER':
        return 'FULFILLING'
      case 'DISPUTE_DELIVERY':
        return 'DISPUTED_DELIVERY'
      case 'UNDISPUTE_DELIVERY':
        return 'DELIVERED'
      case 'PAY':
        return 'PAID'
      case 'ACCEPT_PAYMENT':
        return 'DONE'
      case 'DISPUTE_PAYMENT':
        return 'DISPUTED_PAYMENT'
      case 'UNDISPUTE_PAYMENT':
        return 'PAID'
      case 'RESOLVE':
        return 'DONE'
    }
  }

  act (action: OrderAction) {
    if (this.getPossibleActions().indexOf(action) < 0) throw new Error('Illegal Action')
    return new OrderStateMachine(this.getNextStateForAction(action))
  }
}

export class TenantedOrderStateMachine extends OrderStateMachine {
  private readonly tenant: OrderTenant

  constructor (state: OrderState, tenant: OrderTenant) {
    super(state)
    this.tenant = tenant
  }

  static getPossibleActionsForTenant (tenant: OrderTenant): OrderAction[] {
    switch (tenant) {
      case 'CUSTOMER':
        return ['PLACE','CANCEL', 'UNCANCEL', 'PAY', 'DISPUTE_DELIVERY', 'UNDISPUTE_DELIVERY']
      case 'DELIVERER':
        return ['ACCEPT','UNACCEPT', 'DELIVER', 'UNDELIVER', 'ACCEPT_PAYMENT', 'DISPUTE_PAYMENT', 'UNDISPUTE_PAYMENT']
      case 'MODERATOR':
        return ['RESOLVE']
      case 'SYSTEM':
        return ['EXPIRE']
    }
  }

  getPossibleActionsForStateAndTenant(state: OrderState, tenant: OrderTenant): OrderAction[] {
    const possibleActionsForTenant = TenantedOrderStateMachine.getPossibleActionsForTenant(tenant)
    return this.getPossibleActionsForState(state).filter(action => possibleActionsForTenant.includes(action))
  }

  getPossibleActions () {
    return this.getPossibleActionsForStateAndTenant(this.getState(), this.getTenant())
  }

  getTenant () {
    return this.tenant
  }

  act (action: OrderAction) {
    if (this.getPossibleActions().indexOf(action) < 0) throw new Error('Illegal Action')
    return new TenantedOrderStateMachine(this.getNextStateForAction(action), this.getTenant())
  }

  setTenant (tenant: OrderTenant) {
    return new TenantedOrderStateMachine(this.getState(), tenant)
  }
}
