# Coroute Web Application 

---

## 1. Context and Objective

The **CoRoute** project is a ride-sharing web application inspired by BlaBlaCar, designed to connect drivers and passengers for intercity trips.

###  Main Objective (MVP)

Build a simple platform that allows:
- drivers to publish trips
- passengers to search and book seats

---

## 2. MVP Scope

The MVP includes only the core features required to validate the concept.

###  User Management

- User registration / login
- User profile (name, email, phone)
- Implicit role: driver or passenger

---

###  Trip Management

- Create a trip:
  - Departure city
  - Arrival city
  - Date and time
  - Number of available seats
  - Price per seat

- View available trips

---

###  Search

- Search trips by:
  - Departure city
  - Arrival city
  - Date

---

###  Booking

- Book a seat on a trip
- Manage remaining available seats
- Booking confirmation

---

###  User Dashboard

- View:
  - published trips
  - bookings

---

## 3. Out of Scope (Future Features)

- Online payments
- Rating/review system (drivers & passengers)
- Real-time chat
- Notifications (email/SMS)
- Advanced geolocation (maps)
- Cancellation and refund system

---

## 4. System Actors

- **Visitor**: can browse trips
- **Authenticated User**:
  - Driver: publishes trips
  - Passenger: books trips

---

## 5. Technical Architecture

###  Backend
- Framework: Spring Boot  
- REST API  
- Authentication: JWT  

###  Frontend
- Framework: React  
- Simple and responsive UI  

###  Database
- Microsoft SQL Server (via Docker on macOS)

---
