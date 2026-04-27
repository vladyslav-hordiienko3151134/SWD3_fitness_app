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
//Sofiia Vedenieva

// UPDATE 
export async function PUT(request, { params }) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Organizer or admin access required' }, { status: 403 });
        }

        const event_id = parseInt(params.id);
        if (isNaN(event_id)) {
            return NextResponse.json({ error: 'Invalid event ID, please try again' }, { status: 400 });
        }

        const request_body = await request.json();
        const { isValid, errors } = validateEvent(request_body, true); // isUpdate = true
        if (!isValid) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        // checking if end time is not before starting time
        if (request_body.start_time && request_body.end_time && request_body.end_time <= request_body.start_time) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            //checking if exists
            const [found_events] = await connection.execute(
                'SELECT * FROM events WHERE event_id = ?',
                [event_id]
            );
            if (found_events.length === 0) {
                return NextResponse.json({ error: 'event is not found' }, { status: 404 });
            }
            const existing_event = found_events[0];

            // only organisers  can edit their own events(admin)
            if (session.role !== 'admin' && existing_event.created_by !== session.user_id) {
                return NextResponse.json({ error: 'you can only edit your own events' }, { status: 403 });
            }

            const update_fields = [];
            const query_values = [];

            if (request_body.title !== undefined) {
                update_fields.push('title = ?');
                query_values.push(request_body.title);
            }
            if (request_body.description !== undefined) {
                update_fields.push('description = ?');
                query_values.push(request_body.description);
            }
            if (request_body.instructor_name !== undefined) {
                update_fields.push('instructor_name = ?');
                query_values.push(request_body.instructor_name);
            }
            if (request_body.event_date !== undefined) {
                update_fields.push('event_date = ?');
                query_values.push(request_body.event_date);
            }
            if (request_body.start_time !== undefined) {
                update_fields.push('start_time = ?');
                query_values.push(request_body.start_time);
            }
            if (request_body.end_time !== undefined) {
                update_fields.push('end_time = ?');
                query_values.push(request_body.end_time);
            }
            if (request_body.location !== undefined) {
                update_fields.push('location = ?');
                query_values.push(request_body.location);
            }
            if (request_body.capacity !== undefined) {
               // new capacity shoud be more than previous one
                if (request_body.capacity < existing_event.current_bookings) {
                    return NextResponse.json({
                        error: `Capacity cannot be less than current bookings (${existing_event.current_bookings})`
                    }, { status: 400 });
                }
                update_fields.push('capacity = ?');
                query_values.push(request_body.capacity);
            }

            if (update_fields.length === 0) {
                return NextResponse.json({ error: 'no fields needs to update' }, { status: 400 });
            }

            //updating with SQL
            query_values.push(event_id);
            await connection.execute(
                `UPDATE events SET ${update_fields.join(', ')} WHERE event_id = ?`,
                query_values
            );

            // fwtching update 
            const [updated_event] = await connection.execute(
                'SELECT * FROM events WHERE event_id = ?',
                [event_id]
            );

            return NextResponse.json({ message: 'Event updated successfully', event: updated_event[0] });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

// DELETE 
export async function DELETE(request, { params }) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Organizer or admin access required' }, { status: 403 });
        }

        const event_id = parseInt(params.id);
        if (isNaN(event_id)) {
            return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            // checking exositance and permission
            const [found_events] = await connection.execute(
                'SELECT * FROM events WHERE event_id = ?',
                [event_id]
            );
            if (found_events.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }
            const existing_event = found_events[0];
            if (session.role !== 'admin' && existing_event.created_by !== session.user_id) {
                return NextResponse.json({ error: 'You can only delete your own events' }, { status: 403 });
            }

            //  deletion permitted if there are any bookings
            const [booking_count] = await connection.execute(
                'SELECT COUNT(*) AS number_of_bookings FROM bookings WHERE event_id = ?',
                [event_id]
            );
            if (booking_count[0].number_of_bookings > 0) {
                return NextResponse.json({
                    error: 'Cannot delete event with existing bookings. Cancel all bookings first.'
                }, { status: 409 });
            }

            await connection.execute('DELETE FROM events WHERE event_id = ?', [event_id]);
            return NextResponse.json({ message: 'Event deleted successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}