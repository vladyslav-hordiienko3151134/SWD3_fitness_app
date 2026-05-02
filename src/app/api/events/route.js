import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { validateEvent } from "@/lib/validation";

// GET – read all events
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('id');
        const connection = await pool.getConnection();

        if (eventId) {
            const [events] = await connection.execute(`
                SELECT 
                    class_id as event_id,
                    title,
                    start_time as event_date_time,
                    DATE(start_time) as event_date,
                    TIME(start_time) as start_time,
                    end_time,
                    location,
                    trainer_name as instructor_name,
                    max_capacity as capacity,
                    current_bookings
                FROM fitness_classes
                WHERE class_id = ?
            `, [eventId]);
            connection.release();
            
            if (events.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            if (events[0].start_time && events[0].start_time.length > 5) {
                events[0].start_time = events[0].start_time.substring(0, 5);
            }
            if (events[0].end_time && events[0].end_time.length > 5) {
                events[0].end_time = events[0].end_time.substring(0, 5);
            }

            return NextResponse.json({ event: events[0] });
        }

        const [events] = await connection.execute(`
            SELECT 
                class_id as event_id,
                title,
                start_time as event_date_time,
                DATE(start_time) as event_date,
                TIME(start_time) as start_time,
                end_time,
                location,
                trainer_name as instructor_name,
                max_capacity as capacity,
                current_bookings,
                CASE
                    WHEN current_bookings >= max_capacity THEN 'full'
                    WHEN DATE(start_time) < CURDATE() THEN 'past'
                    ELSE 'available'
                END AS status
            FROM fitness_classes
            WHERE DATE(start_time) >= CURDATE()
               OR DATE(start_time) IS NULL
            ORDER BY start_time ASC
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
        
        // Combine date and time for start_time
        const startDateTime = `${body.event_date} ${body.start_time}:00`;
        const endDateTime = `${body.event_date} ${body.end_time}:00`;

        //inserting event into fitness_classes table
        const [result] = await connection.execute(
            `INSERT INTO fitness_classes
             (title, start_time, end_time, location, trainer_name, max_capacity, current_bookings)
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [
                body.title,
                startDateTime,
                endDateTime,
                body.location,
                body.instructor_name,
                body.capacity
            ]
        );

        //fetch and return new event
        const [newEvent] = await connection.execute(
            `SELECT 
                class_id as event_id,
                title,
                DATE(start_time) as event_date,
                TIME(start_time) as start_time,
                end_time,
                location,
                trainer_name as instructor_name,
                max_capacity as capacity
            FROM fitness_classes WHERE class_id = ?`,
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
export async function PUT(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Organizer or admin access required' }, { status: 403 });
        }

        //getting id by url
        const { searchParams } = new URL(request.url);
        const event_id = parseInt(searchParams.get('id'));
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
            //checking if exists in fitness_classes
            const [found_events] = await connection.execute(
                'SELECT * FROM fitness_classes WHERE class_id = ?',
                [event_id]
            );
            if (found_events.length === 0) {
                return NextResponse.json({ error: 'Event is not found' }, { status: 404 });
            }
            const existing_event = found_events[0];

            // only organisers can edit their own events
            //admin can edit all events (created_by doesn't exist in fitness_classes, so admin only)
            if (session.role !== 'admin') {
                return NextResponse.json({ error: 'Admin access required to edit' }, { status: 403 });
            }

            const update_fields = [];
            const query_values = [];

            if (request_body.title !== undefined) {
                update_fields.push('title = ?');
                query_values.push(request_body.title);
            }
            if (request_body.description !== undefined) {
                // description doesn't exist in fitness_classes, skip
            }
            if (request_body.instructor_name !== undefined) {
                update_fields.push('trainer_name = ?');
                query_values.push(request_body.instructor_name);
            }
            if (request_body.event_date !== undefined && request_body.start_time !== undefined) {
                const newDateTime = `${request_body.event_date} ${request_body.start_time}:00`;
                update_fields.push('start_time = ?');
                query_values.push(newDateTime);
            }
            if (request_body.end_time !== undefined && request_body.event_date !== undefined) {
                const newEndDateTime = `${request_body.event_date} ${request_body.end_time}:00`;
                update_fields.push('end_time = ?');
                query_values.push(newEndDateTime);
            }
            if (request_body.location !== undefined) {
                update_fields.push('location = ?');
                query_values.push(request_body.location);
            }
            if (request_body.capacity !== undefined) {
               // new capacity should not be less than current bookings
                if (request_body.capacity < existing_event.current_bookings) {
                    return NextResponse.json({
                        error: `Capacity cannot be less than current bookings (${existing_event.current_bookings})`
                    }, { status: 400 });
                }
                update_fields.push('max_capacity = ?');
                query_values.push(request_body.capacity);
            }

            if (update_fields.length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
            }

            //updating with SQL
            query_values.push(event_id);
            await connection.execute(
                `UPDATE fitness_classes SET ${update_fields.join(', ')} WHERE class_id = ?`,
                query_values
            );

            // fetching updated event
            const [updated_event] = await connection.execute(
                `SELECT 
                    class_id as event_id,
                    title,
                    DATE(start_time) as event_date,
                    TIME(start_time) as start_time,
                    end_time,
                    location,
                    trainer_name as instructor_name,
                    max_capacity as capacity,
                    current_bookings
                FROM fitness_classes WHERE class_id = ?`,
                [event_id]
            );

            return NextResponse.json({ message: 'Event updated successfully', event: updated_event[0] });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

//DELETE
export async function DELETE(request) {
    try {
        const { session } = getSessionFromRequest(request);
        if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Organizer or admin access required' }, { status: 403 });
        }

        // getting event id from url query 
        const { searchParams } = new URL(request.url);
        const event_id = parseInt(searchParams.get('id'));
        if (isNaN(event_id)) {
            return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            // checking existence and permission
            const [found_events] = await connection.execute(
                'SELECT * FROM fitness_classes WHERE class_id = ?',
                [event_id]
            );
            if (found_events.length === 0) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }
            const existing_event = found_events[0];
            if (session.role !== 'admin') {
                return NextResponse.json({ error: 'Admin access required to delete' }, { status: 403 });
            }

            const [booking_count] = await connection.execute(
                'SELECT COUNT(*) AS number_of_bookings FROM bookings WHERE class_id = ?',
                [event_id]
            );
            if (booking_count[0].number_of_bookings > 0) {
                return NextResponse.json({
                    error: 'Cannot delete event with existing bookings, all booking must be cancelled'
                }, { status: 409 });
            }

            await connection.execute('DELETE FROM fitness_classes WHERE class_id = ?', [event_id]);
            return NextResponse.json({ message: 'Event deleted successfully' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}