# IN-Track MongoDB Schema

## SuperAdmin
- superadmin_id (PK)
- uname
- password

## Admin
- admin_id (PK)
- username
- password

## Company
- company_id (PK)
- company_name
- uid
- password
- subscription_id (FK)

## Subscription
- subscription_id (PK)
- plan_name
- start_date
- monthly_price
- yearly_price

## Role
- role_id (PK)
- company_id (FK)
- role_name

## Owner
- owner_id (PK)
- owner_name
- company_id (FK)
- email

## Manager
- manager_id (PK)
- company_id (FK)
- name
- email
- password

## Inventory
- inventory_id (PK)
- company_id (FK)
- field
- materials

## Raw_Materials
- raw_id (PK)
- inventory_id (FK)
- raw_name
- itemqty
- costprice
- sellingprice

## Clients
- id (PK)
- name

## Client_Requirement
- requirement_id (PK)
- client_id (FK)
- product_name
- per_piece_req

## Order
- order_id (PK)
- company_id (FK)
- order_date
- order_status

## Expenses
- expense_id (PK)
- company_id (FK)
- expense_name
- money

## BalanceSheet
- balance_id (PK)
- company_id (FK)
- date

## Report
- report_id (PK)
- company_id (FK)

## Dashboard
- dashboard_id (PK)
- company_id (FK)
- view
