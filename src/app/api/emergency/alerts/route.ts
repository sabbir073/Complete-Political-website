import { NextResponse } from 'next/server';

interface DisasterAlert {
    id: string;
    event: string;
    severity: string;
    headline: string;
    description: string;
    effective: string;
    expires: string;
    areas: string[];
}

// GET /api/emergency/alerts - Get disaster alerts from free APIs
export async function GET() {
    try {
        const alerts: DisasterAlert[] = [];

        // Try to fetch from ReliefWeb API (UN OCHA) - free disaster alerts
        try {
            const reliefWebResponse = await fetch(
                'https://api.reliefweb.int/v1/disasters?appname=smjahangir-emergency&filter[field]=country.iso3&filter[value]=BGD&limit=5&fields[include][]=name&fields[include][]=description&fields[include][]=date&fields[include][]=status',
                { next: { revalidate: 3600 } } // Cache for 1 hour
            );

            if (reliefWebResponse.ok) {
                const reliefWebData = await reliefWebResponse.json();

                if (reliefWebData.data) {
                    reliefWebData.data.forEach((disaster: {
                        id: number;
                        fields: {
                            name: string;
                            description?: string;
                            date?: { created: string };
                            status?: string;
                        };
                    }) => {
                        alerts.push({
                            id: `reliefweb-${disaster.id}`,
                            event: 'Disaster Alert',
                            severity: disaster.fields.status === 'alert' ? 'severe' : 'moderate',
                            headline: disaster.fields.name,
                            description: disaster.fields.description || '',
                            effective: disaster.fields.date?.created || new Date().toISOString(),
                            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                            areas: ['Bangladesh'],
                        });
                    });
                }
            }
        } catch (reliefWebError) {
            console.error('ReliefWeb API error:', reliefWebError);
        }

        // Try to fetch from GDACS (Global Disaster Alert) RSS-to-JSON
        try {
            const gdacsResponse = await fetch(
                'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,FL,TC,VO&country=BGD&fromDate=' +
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                {
                    next: { revalidate: 3600 },
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (gdacsResponse.ok) {
                // Check if response has content before parsing
                const responseText = await gdacsResponse.text();
                if (responseText && responseText.trim().length > 0) {
                    const gdacsData = JSON.parse(responseText);

                    if (gdacsData.features && Array.isArray(gdacsData.features)) {
                        gdacsData.features.slice(0, 5).forEach((feature: {
                            properties: {
                                eventid: string;
                                eventtype: string;
                                alertlevel: string;
                                name: string;
                                description?: string;
                                fromdate: string;
                                todate: string;
                                country?: string;
                            };
                        }) => {
                            const alertLevel = feature.properties.alertlevel?.toLowerCase() || 'green';
                            const severity = alertLevel === 'red' ? 'extreme'
                                : alertLevel === 'orange' ? 'severe'
                                : alertLevel === 'yellow' ? 'moderate'
                                : 'minor';

                            alerts.push({
                                id: `gdacs-${feature.properties.eventid}`,
                                event: feature.properties.eventtype,
                                severity,
                                headline: feature.properties.name,
                                description: feature.properties.description || '',
                                effective: feature.properties.fromdate,
                                expires: feature.properties.todate,
                                areas: [feature.properties.country || 'Bangladesh'],
                            });
                        });
                    }
                }
            }
        } catch (gdacsError) {
            // Silently handle GDACS API errors - this API may be unreliable
            console.log('GDACS API unavailable, skipping...');
        }

        // If no alerts from APIs, return sample/mock data for demonstration
        if (alerts.length === 0) {
            // Check if it's monsoon season (June-October) to show flood warning
            const currentMonth = new Date().getMonth() + 1;
            if (currentMonth >= 6 && currentMonth <= 10) {
                alerts.push({
                    id: 'seasonal-flood-warning',
                    event: 'Flood Advisory',
                    severity: 'moderate',
                    headline: 'Monsoon Season - Be Prepared for Flooding',
                    description: 'During monsoon season, flooding is common in low-lying areas. Stay alert and follow local authority instructions.',
                    effective: new Date().toISOString(),
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    areas: ['Bangladesh - Low-lying areas'],
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: alerts,
            source: alerts.length > 0 ? 'api' : 'none',
            updated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error in GET /api/emergency/alerts:', error);
        return NextResponse.json({
            success: true,
            data: [],
            source: 'error',
            error: 'Failed to fetch disaster alerts',
        });
    }
}
