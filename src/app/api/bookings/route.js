import {NextResponse} from 'next/server';
import pool from '@/lib/db';
import {getSessionFromRequest} from '@/lib/session';
import {validateBooking} from '@/lib/validation';

// GET – read user's own bookings
export async function GET(request) {
    try {
        const {session} = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({error: 'Authentication required'}, {status: 401});
        }

        const connection = await pool.getConnection();
        try {
            const [bookings] = await connection.execute(
                `SELECT b.*,
                        e.title,
                        e.event_date,
                        e.start_time,
                        e.end_time,
                        e.location,
                        e.instructor_name,
                        e.capacity,
                        e.current_bookings,
                        CASE
                            WHEN e.event_date < CURDATE() THEN 'past'
                            WHEN b.status = 'cancelled' THEN 'cancelled'
                            ELSE 'upcoming'
                            END AS booking_status
                 FROM bookings b
                          JOIN events e ON b.event_id = e.event_id
                 WHERE b.user_id = ?
                 ORDER BY e.event_date ASC, e.start_time ASC`,
                [session.user_id]
            );
            return NextResponse.json({bookings});
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Server error'}, {status: 500});
    }
}

// POST – create a new booking
export async function POST(request) {
    try {
        const {session} = getSessionFromRequest(request);
        if (!session) {
            return NextResponse.json({error: 'Authentication required'}, {status: 401});
        }

        const body = await request.json();
        const {isValid, errors} = validateBooking(body);
        if (!isValid) {
            return NextResponse.json({error: 'Validation failed', details: errors}, {status: 400});
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
                return NextResponse.json({error: 'Event not found'}, {status: 404});
            }

            const eventData = event[0];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (new Date(eventData.event_date) < today) {
                await connection.rollback();
                return NextResponse.json({error: 'Cannot book past events'}, {status: 400});
            }

            if (eventData.current_bookings >= eventData.capacity) {
                await connection.rollback();
                return NextResponse.json({error: 'Event is fully booked'}, {status: 400});
            }

            const [existing] = await connection.execute(
                'SELECT * FROM bookings WHERE user_id = ? AND event_id = ? AND status = "confirmed"',
                [session.user_id, body.event_id]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return NextResponse.json({error: 'Already booked this event'}, {status: 409});
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
                {message: 'Booking created successfully', booking: newBooking[0]},
                {status: 201}
            );
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Server error'}, {status: 500});
    }
}