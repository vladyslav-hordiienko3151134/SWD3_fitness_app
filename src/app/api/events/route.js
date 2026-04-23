import {NextResponse} from 'next/server';
import pool from '@/lib/db';
import {getSessionFromRequest} from '@/lib/session';
import {validateEvent} from "@/lib/validation";
// GET – read all events
export async function GET(request) {
    try {
        const connection = await pool.getConnection();
        const [events] = await connection.execute(`
            SELECT e.*,
                   u.username AS organizer_name,
                   CASE
                       WHEN e.current_bookings >= e.capacity THEN 'full'
                       WHEN e.event_date < CURDATE() THEN 'past'
                       ELSE 'available'
                       END    AS status
            FROM events e
                     LEFT JOIN users u ON e.created_by = u.user_id
            WHERE e.event_date >= CURDATE()
               OR e.event_date IS NULL
            ORDER BY e.event_date ASC, e.start_time ASC
        `);
        connection.release();
        return NextResponse.json({ events });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST – create new event
export async function POST(request) {
    try {
        //checking role
        const { session } = getSessionFromRequest(request);
        if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Organizer access required' }, { status: 403 });
        }

        //validation of input
        const body = await request.json();
        const { isValid, errors } = validateEvent(body, false);
        if (!isValid) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        //check time order
        if (body.end_time <= body.start_time) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        //inserting event
        const [result] = await connection.execute(
            `INSERT INTO events
             (title, description, instructor_name, event_date, start_time, end_time, location, capacity, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                body.title,
                body.description || null,
                body.instructor_name,
                body.event_date,
                body.start_time,
                body.end_time,
                body.location,
                body.capacity,
                session.user_id
            ]
        );

        //fetch and return new event
        const [newEvent] = await connection.execute(
            'SELECT * FROM events WHERE event_id = ?',
            [result.insertId]
        );
        connection.release();

        return NextResponse.json(
            { message: 'Event created successfully', event: newEvent[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}