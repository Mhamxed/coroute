
CREATE TABLE users (
    id INT IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    bio VARCHAR(500),
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL CHECK (role IN ('PASSENGER', 'DRIVER', 'ADMIN')),
    created_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE vehicles (
    plate_number VARCHAR(50) PRIMARY KEY,
    model VARCHAR(100),
    capacity INT CHECK (capacity > 0),
    created_at DATETIME2 DEFAULT GETDATE()
);


CREATE TABLE passengers (
    id INT PRIMARY KEY,
    is_verified BIT DEFAULT 0,
    CONSTRAINT fk_passenger_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE drivers (
    id INT PRIMARY KEY,
    is_verified BIT DEFAULT 0,
    licence_number VARCHAR(100),
    vehicle_plate VARCHAR(50),

    CONSTRAINT fk_driver_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_driver_vehicle FOREIGN KEY (vehicle_plate) REFERENCES vehicles(plate_number)
);


CREATE TABLE admins (
    id INT PRIMARY KEY,
    CONSTRAINT fk_admin_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE trips (
    id INT IDENTITY PRIMARY KEY,
    driver_id INT NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_time DATETIME2 NOT NULL,

    total_seats INT NOT NULL CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    
    price_per_seat DECIMAL(10,2) NOT NULL CHECK (price_per_seat >= 0),

    description VARCHAR(1000),

    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')),

    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers(id),

 
    CONSTRAINT chk_seats CHECK (available_seats <= total_seats)
);


CREATE TABLE bookings (
    id INT IDENTITY PRIMARY KEY,
    trip_id INT NOT NULL,
    passenger_id INT NOT NULL,

    seats_booked INT NOT NULL CHECK (seats_booked > 0),

    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('WAITING', 'SCHEDULED', 'DECLINED')),

    booked_at DATETIME2 DEFAULT GETDATE(),
    created_at DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_booking_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_passenger FOREIGN KEY (passenger_id) REFERENCES passengers(id)
);

CREATE INDEX idx_trip_search 
ON trips(origin_city, destination_city, departure_time);

CREATE INDEX idx_booking_trip 
ON bookings(trip_id);

CREATE INDEX idx_booking_passenger 
ON bookings(passenger_id);
