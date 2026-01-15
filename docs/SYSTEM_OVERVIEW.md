# QN Office Management System - Technical Overview

This document provides a technical overview of the QN Office Management System, covering architecture, authentication, and core module designs.

## 1. System Architecture

The project is built as an Nx Monorepo with the following structure:

- **Frontend (`apps/web`)**: Next.js application using ShadCN UI.
- **Backend (`apps/api`)**: NestJS application providing REST APIs.
- **Bot (`apps/bot`)**: NestJS application integration with Mezon platform.
- **Shared Libraries (`libs`)**: Contains shared types, DTOs, utilities, and UI components used across applications.

### Technology Stack
- **Frameworks**: Next.js (React), NestJS (Node.js).
- **Database**: PostgreSQL with TypeORM.
- **Authentication**: Mezon OAuth integration.
- **Blockchain**: Integration with Dong.mezon for pantry transactions.
- **Monorepo Tooling**: Nx.

## 2. Authentication Flow

Authentication is handled via Mezon OAuth:
1. **Login**: User initiates login from Web -> Redirects to Mezon.
2. **Callback**: Mezon returns code to Backend.
3. **Exchange**: Backend exchanges code for Access/Refresh Tokens.
4. **Session**: Tokens are stored in HTTP-Only cookies.
5. **Identification**: User identity is linked via `mezon_user_id`.

*Detailed flow is documented in [AUTHENTICATION.md](./AUTHENTICATION.md).*

## 3. Core Modules

### 3.1. Staff Management
- **Entity**: `StaffEntity` linked to `UserEntity`.
- **Sync**: Staff list serves as the source of truth for all schedules.
- **Status**: Active/Inactive status determines eligibility for schedules.

### 3.2. Cleaning & Open Talk Schedules
- **Cycles**: Schedules are generated in "Cycles" ensuring everyone participates once per cycle.
- **Automation**: Cron jobs handle cycle generation and status updates.
- **Swapping Logic**: 
  - Strict validation (Future dates only, Same cycle).
  - Request/Approval workflow involving HR/GDVP.

### 3.3. Pantry Transactions
- **Integration**: Connects to Dong.mezon blockchain.
- **Tracking**: Monitors transactions to the office wallet address.
- **Display**: Shows history of pantry payments by staff.

### 3.4. Cron System
Centralized `CronModule` manages all scheduled tasks:
- **Daily 00:00**: Mark completed tasks.
- **Daily 08:00/09:00/17:00**: Notifications and reminders.
- **Weekly**: Schedule generation.

*Detailed cron schedules in [CRON_SYSTEM.md](./CRON_SYSTEM.md).*

## 4. Coding Standards

- **Pagination**: All list APIs return `AppPaginationDto`.
- **Shared Code**: Types/Interfaces must be in `libs/src/types`.
- **API Pattern**: Repository pattern with TypeORM (avoid QueryBuilder where possible).

*Full coding guidelines in [CODING_STANDARDS.md](./CODING_STANDARDS.md).*
