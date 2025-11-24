import React from 'react';
import Link from 'next/link';

interface EventItem {
    id: number;
    title_en: string;
    slug: string;
    event_date: string;
    category?: { name_en: string };
}

export const metadata = {
    title: 'Events',
    description: 'Upcoming and past events',
};

export default async function EventsPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/events?filter=upcoming&limit=100`, {
        cache: 'no-store',
    });
    const { data }: { data: EventItem[] } = await res.json();

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Events</h1>
            {data && data.length > 0 ? (
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((event) => (
                            <tr key={event.id} className="border-t">
                                <td className="px-4 py-2">
                                    <Link
                                        href={`/events/${event.slug}`}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {event.title_en}
                                    </Link>
                                </td>
                                <td className="px-4 py-2">{new Date(event.event_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2">{event.category?.name_en ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
}
