import React from 'react';
import { notFound } from 'next/navigation';

interface EventDetail {
    id: number;
    title_en: string;
    slug: string;
    event_date: string;
    description_en?: string;
    category?: { name_en: string };
}

export const metadata = {
    title: 'Event Detail',
    description: 'Details of the event',
};

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/events/${slug}`,
        { cache: 'no-store' }
    );
    if (!res.ok) {
        notFound();
    }
    const event: EventDetail = await res.json();

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{event.title_en}</h1>
            <p className="text-gray-600 mb-2">
                {new Date(event.event_date).toLocaleDateString()}
                {event.category?.name_en ? ` • ${event.category.name_en}` : ''}
            </p>
            {event.description_en && (
                <div className="prose" dangerouslySetInnerHTML={{ __html: event.description_en }} />
            )}
        </div>
    );
}
