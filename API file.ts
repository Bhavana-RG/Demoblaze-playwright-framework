import { test, expect, request } from '@playwright/test';

test('Booking lifecycle', async () => {

    const apiContext = await request.newContext({
        baseURL: 'https://restful-booker.herokuapp.com'
    });

    // Authenticate
    const authResponse = await apiContext.post('/auth', {
        data: {
            username: 'admin',
            password: 'password123'
        }
    });

    expect(authResponse.status()).toBe(200);

    const authBody = await authResponse.json();
    const token = authBody.token;

    // Create Booking
    const createResponse = await apiContext.post('/booking', {
        data: {
            firstname: 'John',
            lastname: 'Doe',
            totalprice: 100,
            depositpaid: true,
            bookingdates: {
                checkin: '2026-01-01',
                checkout: '2026-01-10'
            },
            additionalneeds: 'Breakfast'
        }
    });

    expect(createResponse.status()).toBe(200);

    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Retrieve Booking
    const getResponse = await apiContext.get(`/booking/${bookingId}`);
    expect(getResponse.status()).toBe(200);

    const booking = await getResponse.json();
    expect(booking.firstname).toBe('John');

    // Update Booking
    const updateResponse = await apiContext.put(`/booking/${bookingId}`, {
        headers: {
            Cookie: `token=${token}`
        },
        data: {
            firstname: 'UpdatedJohn',
            lastname: 'Doe',
            totalprice: 200,
            depositpaid: true,
            bookingdates: {
                checkin: '2026-01-01',
                checkout: '2026-01-15'
            },
            additionalneeds: 'Lunch'
        }
    });

    expect(updateResponse.status()).toBe(200);

    // Verify Update
    const verifyResponse = await apiContext.get(`/booking/${bookingId}`);
    const updatedBooking = await verifyResponse.json();

    expect(updatedBooking.firstname).toBe('UpdatedJohn');
    expect(updatedBooking.totalprice).toBe(200);

    // Delete Booking
    const deleteResponse = await apiContext.delete(`/booking/${bookingId}`, {
        headers: {
            Cookie: `token=${token}`
        }
    });

    expect(deleteResponse.status()).toBe(201);

    // Verify Deletion
    const deletedResponse = await apiContext.get(`/booking/${bookingId}`);
    expect(deletedResponse.status()).toBe(404);
});