# Barber Shop Appointment Booking System

A full-stack **Next.js** application for managing appointments at a barber shop. This system allows customers to book appointments online and provides an admin interface for staff to manage bookings and barber schedules.

## Features

### Customer Features
- Browse available services with pricing
- Select preferred barber and date
- View available time slots based on barber availability
- Book appointments without requiring registration
- Receive confirmation with a reference number

### Admin Features
- Secure admin login portal
- Dashboard to view all appointments
- Calendar view for daily scheduling
- Ability to block out time slots (vacations, training, etc.)
- Manage barbers, services, and business settings

## Tech Stack

- **Frontend:** Next.js 14 with App Router, React 19, TypeScript
- **UI Components:** shadcn/ui, Tailwind CSS, Lucide React icons
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Custom auth implementation with secure cookies
- **Form Handling:** React Hook Form with Zod validation

## Getting Started

### Prerequisites
- **Node.js** 18.17.0 or later
- **PostgreSQL** database
- **npm** or **yarn**

### Installation

#### 1. Clone the repository:
```sh
git clone https://github.com/kabiruH/barber-shop-appointment.git
cd barber-shop-appointment
```

#### 2. Install dependencies:
```sh
npm install  # or yarn install
```

#### 3. Set up environment variables:
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_secret_key
```

#### 4. Run database migrations:
```sh
npx prisma migrate dev --name init
```

#### 5. Start the development server:
```sh
npm run dev  # or yarn dev
```

The application should now be running at `http://localhost:3000`.

## Usage

- **Customers:** Visit the website, select a service, choose a barber and time, and confirm the appointment.
- **Admins:** Log in to manage appointments, barbers, and business settings.

## License
This project is open-source and available under the MIT License.

---

Feel free to reach out at huriakelvin@gmail.com and remember to leave a star! 🚀

