import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { validateBooking } from '@/lib/validation';

//Sofiia Vedenieva
// validating booking status updates
function validateBookingUpdate(data) {
    const errors = {};
    if (data.status && !['confirmed', 'cancelled', 'attended'].includes(data.status)) {
        errors.status = 'Status must be confirmed, cancelled or attended';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
}

//Ivan Spinko
// GET – read user's own bookings
export async function GET(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const connection = await pool.getConnection();
        try {
            const [bookings] = await connection.execute(
               `SELECT b.*,
                        fc.title,
                        DATE(fc.start_time) as event_date,
                        TIME(fc.start_time) as start_time,
                        fc.end_time,
                        fc.location,
                        fc.trainer_name as instructor_name,
                        fc.max_capacity as capacity,
                        fc.current_bookings
                 FROM bookings b
                 JOIN fitness_classes fc ON b.class_id = fc.class_id
                 WHERE b.user_id = ?
                 ORDER BY fc.start_time ASC`,
                [session.user_id]
            );
            return NextResponse.json({ bookings });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST – create a new booking
export async function POST(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { isValid, errors } = validateBooking(body);
        if (!isValid) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            //lock event row to prevent race conditions
            const [event] = await connection.execute(
                'SELECT * FROM events WHERE event_id = ? FOR UPDATE',
                [body.event_id]
            );
            if (event.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            const eventData = event[0];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (new Date(eventData.event_date) < today) {
                await connection.rollback();
                return NextResponse.json({ error: 'Cannot book past events' }, { status: 400 });
            }

            if (eventData.current_bookings >= eventData.capacity) {
                await connection.rollback();
                return NextResponse.json({ error: 'Event is fully booked' }, { status: 400 });
            }

            const [existing] = await connection.execute(
                'SELECT * FROM bookings WHERE user_id = ? AND event_id = ? AND status = "confirmed"',
                [session.user_id, body.event_id]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Already booked this event' }, { status: 409 });
            }

            const [result] = await connection.execute(
                'INSERT INTO bookings (user_id, event_id, status) VALUES (?, ?, "confirmed")',
                [session.user_id, body.event_id]
            );

            await connection.execute(
                'UPDATE events SET current_bookings = current_bookings + 1 WHERE event_id = ?',
                [body.event_id]
            );

            await connection.commit();

            const [newBooking] = await connection.execute(
                `SELECT b.*, e.title, e.event_date, e.start_time, e.end_time
                 FROM bookings b
                          JOIN events e ON b.event_id = e.event_id
                 WHERE b.booking_id = ?`,
                [result.insertId]
            );

            return NextResponse.json(
                { message: 'Booking created successfully', booking: newBooking[0] },
                { status: 201 }
            );
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
//Sofiia Vedenieva
export async function PUT(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // reading booking id from URL search param
        const { searchParams } = new URL(request.url);
        const bookingId = parseInt(searchParams.get('id'));
        if (isNaN(bookingId)) {
            return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
        }

        const body = await request.json();
        const { isValid, errors } = validateBookingUpdate(body);
        if (!isValid) {
            return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            // connecting event details with booking id
            const [bookings] = await connection.execute(
                `SELECT b.*, e.event_date, e.current_bookings, e.capacity
                 FROM bookings b
                 JOIN events e ON b.event_id = e.event_id
                 WHERE b.booking_id = ?`,
                [bookingId]
            );
            if (bookings.length === 0) {
                return NextResponse.json({ error: 'Booking is not found, please try again' }, { status: 404 });
            }
            const booking = bookings[0];

            //admin can change status
            if (session.role !== 'admin') {
                return NextResponse.json({ error: 'Admin access required to update booking status' }, { status: 403 });
            }

            // if cancelling, update capacity
            if (body.status === 'cancelled' && booking.status !== 'cancelled') {
                await connection.execute(
                    'UPDATE events SET current_bookings = current_bookings - 1 WHERE event_id = ?',
                    [booking.event_id]
                );
            } else if (body.status === 'confirmed' && booking.status === 'cancelled') {
                // checking capacity before restoring
                const [event] = await connection.execute(
                    'SELECT current_bookings, capacity FROM events WHERE event_id = ?',
                    [booking.event_id]
                );
                if (event[0].current_bookings >= event[0].capacity) {
                    return NextResponse.json({ error: 'Event is fully booked, please try again later' }, { status: 400 });
                }
                await connection.execute(
                    'UPDATE events SET current_bookings = current_bookings + 1 WHERE event_id = ?',
                    [booking.event_id]
                );
            }

            await connection.execute(
                'UPDATE bookings SET status = ? WHERE booking_id = ?',
                [body.status, bookingId]
            );

            const [updated] = await connection.execute(
                'SELECT * FROM bookings WHERE booking_id = ?',
                [bookingId]
            );
            return NextResponse.json({ message: 'Booking updated', booking: updated[0] });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

// DELETE 
export async function DELETE(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // reading booking id from URL search param
        const { searchParams } = new URL(request.url);
        const bookingId = parseInt(searchParams.get('id'));
        if (isNaN(bookingId)) {
            return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // fetching booking with event details
            const [bookings] = await connection.execute(
                `SELECT b.*, e.event_date, e.current_bookings
                 FROM bookings b
                 JOIN events e ON b.event_id = e.event_id
                 WHERE b.booking_id = ? FOR UPDATE`,
                [bookingId]
            );
            if (bookings.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
            }
            const booking = bookings[0];

            // user owns booking
            if (session.role !== 'admin' && booking.user_id !== session.user_id) {
                await connection.rollback();
                return NextResponse.json({ error: 'You can only cancel your own bookings' }, { status: 403 });
            }

            // checking if event is in the past
            const today = new Date().toISOString().split('T')[0];
            if (booking.event_date < today) {
                await connection.rollback();
                return NextResponse.json({ error: 'Cannot cancel finished events' }, { status: 400 });
            }

            // deleting booking and freeing up a spot if it was confirmed
            if (booking.status === 'confirmed') {
                await connection.execute(
                    'UPDATE events SET current_bookings = current_bookings - 1 WHERE event_id = ?',
                    [booking.event_id]
                );
            }
            await connection.execute('DELETE FROM bookings WHERE booking_id = ?', [bookingId]);

            await connection.commit();
            return NextResponse.json({ message: 'Booking cancelled successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
    }
}