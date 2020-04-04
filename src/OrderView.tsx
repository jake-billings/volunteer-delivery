import React, { useState } from 'react'
import { OrderAction, OrderTenant, TenantedOrderStateMachine } from './Order'

const OrderView = () => {
  const [orderState, setOrderState] = useState(new TenantedOrderStateMachine('NOT_PLACED', 'CUSTOMER'))

  const onClickAction = (action: OrderAction) => () => {
    setOrderState(orderState.act(action))
  }

  const onClickTenant = (tenant: OrderTenant) => () => {
    setOrderState(orderState.setTenant(tenant))
  }

  return (
    <>
      <p>Tenant</p>
      <p>{orderState.getTenant()}</p>
      <ul>
        {(['CUSTOMER', 'DELIVERER', 'MODERATOR', 'SYSTEM'] as OrderTenant[])
          .filter(tenant => orderState.getTenant() !== tenant)
          .map(tenant => (
            <li>
              <button onClick={onClickTenant(tenant)}>{tenant}</button>
            </li>
          ))}
      </ul>
      <p>{orderState.getState()}</p>
      <ul>
        {orderState.getPossibleActions().map(action => (
          <li>
            <button onClick={onClickAction(action)}>{action}</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default OrderView
