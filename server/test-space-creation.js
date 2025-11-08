
import fetch from 'node-fetch';

const createSpace = async () => {
  const url = 'http://localhost:5002/api/v1/spaces';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGUxOWVkNWM2NzAwNmJiOTk2ODQzNiIsImlhdCI6MTc2MjUzMjQ0MSwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTc2MjUzMzM0MSwiYXVkIjoiZ3JpZHNwYWNlLWNsaWVudCIsImlzcyI6ImdyaWRzcGFjZS1iYWNrZW5kIn0.iyY3SQpuqoZ4SB5OrA6FXF0p6ciRvjKmtaLBeMjLQgg';
  const data = {
    title: 'Cozy Workspace in Downtown',
    description: 'A quiet and comfortable workspace with high-speed internet, perfect for remote work.',
    address: '123 Main St, New York, NY 10001',
    location: {
      type: 'Point',
      coordinates: [-73.9876, 40.7484]
    },
    pricePerHour: 15,
    capacity: 4,
    amenities: ['wifi', 'power-outlets', 'coffee', 'printer'],
    availability: [
      { day: 'monday', open: '09:00', close: '18:00' },
      { day: 'tuesday', open: '09:00', close: '18:00' },
      { day: 'wednesday', open: '09:00', close: '18:00' },
      { day: 'thursday', open: '09:00', close: '18:00' },
      { day: 'friday', open: '09:00', close: '18:00' }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error);
  }
};

createSpace();
